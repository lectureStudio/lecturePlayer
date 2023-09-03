import { Janus, JanusMessage, VideoRoomParticipant, JSEP, PluginHandle, VideoRoomConfigureRequest } from "janus-gateway";
import { MediaType } from "../model/media-type";
import { Devices } from "../utils/devices";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { JanusParticipant, JanusStreamType } from "./janus-participant";
import { userStore } from "../store/user.store";
import { deviceStore } from "../store/device.store";
import { participantStore } from "../store/participants.store";
import { courseStore } from "../store/course.store";
import { CourseMediaApi } from "../transport/course-media-api";
import { LpDeviceChangeEvent } from "../event";
import { EventEmitter } from "../utils/event-emitter";

export class JanusPublisher extends JanusParticipant {

	private readonly roomId: number;

	private readonly opaqueId: string;

	private publisherId: bigint;

	cameraEnabled: boolean;


	constructor(janus: Janus, roomId: number, opaqueId: string, eventEmitter: EventEmitter) {
		super(janus, eventEmitter);

		this.roomId = roomId;
		this.opaqueId = opaqueId;
		this.cameraEnabled = true;

		eventEmitter.addEventListener("lp-device-change", this.onDeviceChange.bind(this));
		eventEmitter.addEventListener("lp-share-screen", this.onShareScreen.bind(this));
	}

	override connect() {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: this.onConnected.bind(this),
			error: this.onError.bind(this),
			iceState: this.onIceState.bind(this),
			mediaState: this.onMediaState.bind(this),
			webrtcState: this.onWebRtcState.bind(this),
			slowLink: this.onSlowLink.bind(this),
			onmessage: this.onMessage.bind(this),
			onlocaltrack: this.onLocalTrack.bind(this),
			oncleanup: this.onCleanUp.bind(this),
			ondetached: this.onDetached.bind(this),
			consentDialog: (on: boolean) => {
				if (!on) {
					this.eventEmitter.dispatchEvent(Utils.createEvent("lect-device-permission-change"));
				}
			}
		});
	}

	override disconnect() {
		const unpublish = { request: "unpublish" };

		this.handle.send({ message: unpublish });

		super.disconnect();
	}

	getPublisherId(): bigint {
		return this.publisherId;
	}

	setCameraEnabled(enabled: boolean) {
		this.cameraEnabled = enabled;
	}

	sendData(data: ArrayBuffer) {
		if (this.state !== State.CONNECTED) {
			return;
		}

		this.handle.data({
			data: data,
			error: function (error: unknown) { console.error(error) }
		});
	}

	private onConnected(handle: PluginHandle) {
		this.handle = handle;

		const join = {
			request: "join",
			ptype: "publisher",
			room: this.roomId,
			display: userStore.userId
		};

		this.handle.send({ message: join });
	}

	protected override onWebRtcState(isConnected: boolean) {
		Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");

		if (!isConnected) {
			this.setState(State.DISCONNECTED);
		}
	}

	private onMessage(message: JanusMessage, jsep?: JSEP) {
		// console.log("message pub", message);

		const event = message.videoroom;

		if (message.error) {
			Janus.error(message.error);
			return;
		}
		if (message.unpublished) {
			const unpublished = message.unpublished;

			if (unpublished === "ok") {
				// That's us.
				this.handle.hangup();
				return;
			}
			return;
		}

		if (event) {
			if (event === "joined" && message.id) {
				this.publisherId = BigInt(message.id);

				this.createOffer();
				this.setState(State.CONNECTING);
			}
	
			if (event === "event") {
				const configured = message.configured;
				const publishers = message.publishers;
				const leaving = message.leaving;

				if (publishers) {
					for (const publisher of publishers) {
						const found = this.publishers.find(p => p.id === publisher.id);

						if (!found) {
							this.publishers.push(publisher);
						}

						this.dispatchEvent(Utils.createEvent("lp-participant-joined", publisher));
					}
				}

				if (leaving) {
					// 'leaving' is here the unique identifier of the publisher who left.
					const publisher: VideoRoomParticipant = {
						id: leaving as bigint
					};

					this.dispatchEvent(Utils.createEvent("lp-participant-left", publisher));
					return;
				}

				if (configured === "ok") {
					// Map stream types to their mid.
					if (message.streams) {
						for (const stream of message.streams) {
							this.setStream(stream);
						}
					}

					// console.log("pub streamMids", this.streamMids);

					this.setState(State.CONNECTED);
				}
			}

			if (event === "talking" || event === "stopped-talking") {
				// The 'message.id' is the id of the publisher who is talking right now.
				const talking = {
					id: message.id,
					state: event,
				}

				this.eventEmitter.dispatchEvent(Utils.createEvent("participant-talking", talking));
			}
		}

		if (jsep) {
			this.handle.handleRemoteJsep({ jsep: jsep });

			// Check if any of the media we wanted to publish has
			// been rejected (e.g., wrong or unsupported codec)
			// const audio = message["audio_codec"];
			// const video = message["video_codec"];
		}
	}

	private onLocalTrack(track: MediaStreamTrack, active: boolean) {
		// We use the track ID as name of the element, but it may contain invalid characters.
		const trackId = this.getTrackId(track);

		if (!active) {
			this.removeTrack(trackId, track.kind);
			return;
		}

		this.addTrack(trackId, track);
	}

	private onShareScreen(event: CustomEvent) {
		const shareConfig = event.detail;
		const share = shareConfig.shareScreen;
		const screenMid = this.getStreamMid(JanusStreamType.screen);

		if (screenMid) {
			// There is already an active track that can be removed.
			this.muteTrack(screenMid, share, MediaType.Screen, Devices.screenErrorHandler);
		}
		else if (share) {
			// A new track needs to be added and other participants notified of its existence.
			this.addNewTrack(JanusStreamType.screen, true, Devices.screenErrorHandler)
				.then(() => {
					this.setScreenState(true);
				});
		}
	}

	private onDeviceChange(event: LpDeviceChangeEvent) {
		const deviceSetting = event.detail;
		const muted = deviceSetting.muted;

		if (muted) {
			return;
		}

		const deviceId = deviceSetting.deviceId;
		const kind = deviceSetting.kind;
		const type = kind === "audioinput" ? JanusStreamType.audio : (kind === "videoinput" ? JanusStreamType.video : null);

		if (type == null) {
			// Neither camera nor microfone, speaker probably. Nothing to do for publisher in this case.
			return;
		}

		const captureSettings: MediaTrackConstraints = {
			deviceId: deviceId
		};

		if (type === JanusStreamType.video) {
			captureSettings.width = { ideal: 1280 };
			captureSettings.height = { ideal: 720 };
		}

		if (this.getStreamMid(type)) {
			// There is already an active track that can be replaced.
			this.replaceTrack(type, captureSettings, Devices.cameraErrorHandler);
		}
		else {
			// A new track needs to be added and other participants notified of its existence.
			this.addNewTrack(type, captureSettings, Devices.cameraErrorHandler);
		}
	}

	private getTrackId(track: MediaStreamTrack) {
		return track.id.replace(/[{}]/g, "");
	}

	private createOffer() {
		const videoEnable = this.cameraEnabled ? deviceStore.cameraDeviceId != null && !deviceStore.cameraMuteOnEntry : false;
		const videoCapture = videoEnable
			? {
				deviceId: deviceStore.cameraDeviceId,
				width: { ideal: 1280 },
				height: { ideal: 720 },
			}
			: false;

		const audioCapture = deviceStore.microphoneDeviceId != null && !deviceStore.microphoneBlocked
			? {
				deviceId: deviceStore.microphoneDeviceId,
			}
			: undefined;

		// Publish our stream.
		this.handle.createOffer({
			// Publishers are sendonly.
			tracks: [
				{
					type: JanusStreamType.audio,
					capture: audioCapture,
					recv: false
				},
				{
					type: JanusStreamType.video,
					capture: videoCapture,
					recv: false
				},
				{
					type: JanusStreamType.data,
				}
			],
			success: (jsep: JSEP) => {
				Janus.debug("Got publisher SDP!", jsep);

				// Muting microphone is handled differently as the camera, since the audio track is always present.
				if (deviceStore.microphoneMuteOnEntry) {
					this.handle.muteAudio();
				}

				const publish = {
					request: "configure"
				};

				this.handle.send({ message: publish, jsep: jsep });
			},
			error: (error: unknown) => {
				Janus.error("WebRTC error:", error);
				console.log("error  " + error);
				this.onError(error);
			}
		});
	}

	private addTrack(id: string, track: MediaStreamTrack) {
		if (this.streams.has(id)) {
			// Do not add duplicate tracks.
			return;
		}

		if (track.kind === "audio") {
			// Ignore local audio tracks, they'd generate echo anyway.
			this.setMicrophoneState(true);
			return;
		}
		else if (track.kind === "video") {
			const stream = new MediaStream();
			stream.addTrack(track);

			this.streams.set(id, stream);

			const constraints = track.getConstraints();

			if (constraints.deviceId) {
				// console.log("---- add video");

				// Must be a camera device.
				if (userStore.userId) {
					participantStore.setParticipantCameraStream(userStore.userId, stream);
				}

				this.setCameraState(true);
			}
			else {
				// console.log("---- add screen");

				if (userStore.userId) {
					participantStore.setParticipantScreenStream(userStore.userId, stream);
				}

				this.setScreenState(true);
			}
		}
	}

	private removeTrack(id: string, kind: string) {
		const stream = this.streams.get(id);
		let deviceId;

		if (!stream) {
			return;
		}

		for (const t of stream.getTracks()) {
			if (t.kind === kind) {
				deviceId = t.getConstraints().deviceId;

				t.stop();
				break;
			}
		}

		this.streams.delete(id);

		if (kind === "audio") {
			if (userStore.userId) {
				participantStore.removeParticipantMicrophoneStream(userStore.userId);
			}
		}
		else if (kind === "video") {
			if (deviceId) {

				// console.log("---- remove video");

				// Must be a camera device.
				if (userStore.userId) {
					participantStore.removeParticipantCameraStream(userStore.userId);
				}
			}
			else {

				// console.log("---- remove screen");

				if (userStore.userId) {
					participantStore.removeParticipantScreenStream(userStore.userId);
				}
			}
		}
	}

	protected override onMuteAudio(mute: boolean) {
		super.onMuteAudio(mute);

		this.setMicrophoneState(!mute);
	}

	protected override onMuteVideo(mute: boolean) {
		super.onMuteVideo(mute);

		const cameraMid = this.getStreamMid(JanusStreamType.video);

		if (cameraMid) {
			// There is already an active track that can be muted.
			this.muteTrack(cameraMid, !mute, MediaType.Camera, Devices.cameraErrorHandler);
		}
		else {
			// A new track needs to be added and other participants notified of its existence.
			const captureSettings: MediaTrackConstraints = {
				deviceId: deviceStore.cameraDeviceId,
				width: { ideal: 1280 },
				height: { ideal: 720 }
			};

			this.addNewTrack(JanusStreamType.video, captureSettings, Devices.cameraErrorHandler)
				.then(() => {
					this.setCameraState(true);
				});
		}
	}

	private addNewTrack(type: JanusStreamType, captureSettings: boolean | MediaTrackConstraints, onError: (error: unknown) => void) {
		return new Promise<void>(resolve => {
			this.handle.createOffer({
				tracks: [
					{
						type: type,
						add: true,
						capture: captureSettings,
					}
				],
				success: (jsep: JSEP) => {
					// Got new SDP, send it to the gateway.
					const configure: VideoRoomConfigureRequest = {
						request: "configure"
					};

					// Find the new 'mid' of the newly added track.
					const mids = [...this.streamMids.values()];

					for (const transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
						if (!mids.find(mid => mid === transceiver.mid)) {
							if (!transceiver.mid) {
								continue;
							}
							// Found new 'mid', attach description to it, so subscribers know what to do with it,
							// e.g. where to display the track.
							if (type === JanusStreamType.screen) {
								configure.descriptions = [
									{
										mid: transceiver.mid,
										description: "screen-share"
									}
								];
							}
							break;
						}
					}

					this.handle.send({
						message: configure,
						jsep: jsep,
						success: () => resolve(),
						error: onError
					});
				},
				error: onError
			});
		});
	}

	private replaceTrack(type: JanusStreamType, captureSettings: boolean | MediaTrackConstraints, onError: (error: unknown) => void) {
		// Before we replace the track, we stop and remove the active track.
		const mid = this.getStreamMid(type);

		for (const transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
			if (transceiver.mid === mid) {
				this.removeSenderTrack(transceiver);
				break;
			}
		}

		this.handle.replaceTracks({
			tracks: [
				{
					type: type,
					replace: true,
					capture: captureSettings,
				}
			],
			error: onError
		});
	}

	private async replaceSenderTrack(transceiver: RTCRtpTransceiver) {
		if (!transceiver.mid) {
			return;
		}

		// Find the Janus track type.
		const type = this.getStreamTypeForMid(transceiver.mid);
		let track;

		if (!type) {
			console.error("No track to replace for mid", transceiver.mid);
			return;
		}
		else if (type === JanusStreamType.video) {
			// Query video device to get a new video stream.
			const stream = await Devices.getVideoStream();
			track = stream.getVideoTracks()[0];
		}
		else if (type === JanusStreamType.screen) {
			// Query screen to get a new video stream.
			const stream = await Devices.getScreenStream();
			track = stream.getVideoTracks()[0];

			// Listen to the 'end screen-share' browser button event.
			track.onended = () => {
				const mid = this.getStreamMid(type);
				if (mid) {
					this.muteTrack(mid, false, MediaType.Screen, (error) => {
						console.error("Mute screen failed", error);
					});
				}
			}
		}

		if (!track) {
			console.error("No track to replace, track is null");
			return;
		}

		const trackId = this.getTrackId(track);

		// Set the new active video track.
		await transceiver.sender.replaceTrack(track);

		// Notification of new track.
		this.addTrack(trackId, track);
	}

	private removeSenderTrack(transceiver: RTCRtpTransceiver) {
		// Remove the current video track since we are not sending anything as of now.
		transceiver.sender.replaceTrack(null);

		const track = transceiver.sender.track;

		if (track) {
			const trackId = this.getTrackId(track);

			// Stopping the video track will turn off the active device.
			track.stop();

			// Notification of track removal.
			this.removeTrack(trackId, track.kind);
		}
	}

	private async enableTrack(mid: string, enable: boolean) {
		for (const transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
			if (transceiver.mid === mid) {
				// Toggle transceiver direction in order to tell the gateway whether video
				// should be relayed to other participants or not.
				transceiver.direction = enable ? "sendonly" : "inactive";

				if (enable) {
					await this.replaceSenderTrack(transceiver);
				}
				else {
					this.removeSenderTrack(transceiver);
				}
				break;
			}
		}

		// Manipulating transceiver (direction) requires updating the session description
		// that is offered to the gateway.
		this.handle.createOffer({
			success: (jsep: JSEP) => {
				// Got new SDP, send it to the gateway.
				const configure = {
					request: "configure"
				};

				this.handle.send({ message: configure, jsep: jsep });
			},
			error: (error: unknown) => {
				console.error("Create offer error", error);
			}
		});
	}

	private async muteTrack(mid: string, enable: boolean, mediaType: MediaType, onError: (error: unknown) => void) {
		this.enableTrack(mid, enable)
			.then(() => {
				switch (mediaType) {
					case MediaType.Audio:
						this.setMicrophoneState(enable);
						break;

					case MediaType.Camera:
						this.setCameraState(enable);
						break;

					case MediaType.Screen:
						this.setScreenState(enable);
						break;
				}
			})
			.catch(onError);
	}

	private setMicrophoneState(active: boolean) {
		if (userStore.userId) {
			participantStore.setParticipantMicrophoneActive(userStore.userId, active);
		}

		CourseMediaApi.updateMediaStreamState(courseStore.courseId, { Audio: active })
			.catch(error => {
				console.error("Update media state failed", error);
			});
	}

	private setCameraState(active: boolean) {
		if (userStore.userId) {
			participantStore.setParticipantCameraActive(userStore.userId, active);
		}

		CourseMediaApi.updateMediaStreamState(courseStore.courseId, { Camera: active })
			.catch(error => {
				console.error("Update media state failed", error);
			});
	}

	private setScreenState(active: boolean) {
		if (userStore.userId) {
			participantStore.setParticipantScreenActive(userStore.userId, active);
		}

		CourseMediaApi.updateMediaStreamState(courseStore.courseId, { Screen: active })
			.catch(error => {
				console.error("Update media state failed", error);
			});
	}
}