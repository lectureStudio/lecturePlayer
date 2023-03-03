import { Janus, JanusRoomParticipant, JSEP, PluginHandle } from "janus-gateway";
import { StreamMediaChangeAction } from "../action/stream.media.change.action";
import { course } from "../model/course";
import { MediaType } from "../model/media-type";
import { Devices } from "../utils/devices";
import { Settings } from "../utils/settings";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { JanusParticipant, JanusStreamType } from "./janus-participant";

export class JanusPublisher extends JanusParticipant {

	private readonly roomId: number;

	private readonly opaqueId: string;

	private publisherId: bigint;

	private publisherName: string;

	// Janus stream type to mid mapping.
	private streamMids: Map<string, string>;


	constructor(janus: Janus, roomId: number, opaqueId: string, userName: string) {
		super(janus);

		this.roomId = roomId;
		this.opaqueId = opaqueId;
		this.view.isLocal = true;
		this.publisherName = userName;
		this.view.name = userName;
		this.streamMids = new Map();

		document.addEventListener("lect-device-change", this.onDeviceChange.bind(this));
		document.addEventListener("lect-share-screen", this.onShareScreen.bind(this));
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
			ondetached: this.onDetached.bind(this)
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

	private onConnected(handle: PluginHandle) {
		this.handle = handle;

		const subscribe = {
			request: "join",
			ptype: "publisher",
			room: this.roomId,
			display: this.publisherName ? this.publisherName : course.userId
		};

		this.handle.send({ message: subscribe });
	}

	protected onWebRtcState(isConnected: boolean) {
		Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");

		if (!isConnected) {
			this.setState(State.DISCONNECTED);
		}
	}

	private onMessage(message: any, jsep?: JSEP) {
		console.log("message pub", message);

		const event = message["videoroom"];

		if (message["error"]) {
			Janus.error(message["error"]);
			return;
		}
		if (message["unpublished"]) {
			const unpublished = message["unpublished"];

			if (unpublished === "ok") {
				// That's us.
				this.handle.hangup();
				return;
			}
			return;
		}

		if (event) {
			if (event === "joined") {
				this.publisherId = BigInt(message["id"]);

				this.gridElement.publisherId = this.publisherId;

				this.createOffer();
				this.setState(State.CONNECTING);
			}
	
			if (event === "event") {
				const configured = message.configured;
				const publishers = message.publishers;
				const leaving = message.leaving;

				if (publishers) {
					for (let publisher of publishers) {
						const found = this.publishers.find(p => p.id === publisher.id);

						if (!found) {
							this.publishers.push(publisher);
						}

						this.dispatchEvent(Utils.createEvent("janus-participant-joined", publisher));
					}
				}

				if (leaving) {
					// 'leaving' is here the unique identifier of the publisher who left.
					const publisher: JanusRoomParticipant = {
						id: leaving
					};

					this.dispatchEvent(Utils.createEvent("janus-participant-left", publisher));
					return;
				}

				if (configured === "ok") {
					// Map stream types to their mid.
					for (let stream of message.streams) {
						this.setStream(stream);
					}

					console.log(this.streamMids);

					this.setState(State.CONNECTED);
				}
			}

			if (event === "talking" || event === "stopped-talking") {
				// The 'message.id' is the id of the publisher who is talking right now.
				const talking = {
					id: message.id,
					state: event,
				}

				document.dispatchEvent(Utils.createEvent("participant-talking", talking));
			}
		}

		if (jsep) {
			this.handle.handleRemoteJsep({ jsep: jsep });

			// Check if any of the media we wanted to publish has
			// been rejected (e.g., wrong or unsupported codec)
			const audio = message["audio_codec"];
			const video = message["video_codec"];
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
			this.muteTrack(screenMid, share, MediaType.Screen);
		}
		else if (share) {
			// A new track needs to be added and other participants notified of its existence.
			this.addNewTrack(JanusStreamType.screen, true);
		}
	}

	private onDeviceChange(event: CustomEvent) {
		const deviceSetting: MediaDeviceSetting = event.detail;
		const muted = deviceSetting.muted;

		if (muted) {
			return;
		}

		const deviceId = deviceSetting.deviceId;
		const kind = deviceSetting.kind;
		const type = kind === "audioinput" ? JanusStreamType.audio : (kind === "videoinput" ? JanusStreamType.video : null);

		if (!type) {
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
			this.replaceTrack(type, captureSettings);
		}
		else {
			// A new track needs to be added and other participants notified of its existence.
			this.addNewTrack(type, captureSettings);
		}
	}

	private getStreamMid(type: JanusStreamType) {
		return this.streamMids.get(type);
	}

	private setStream(stream: any) {
		const type = this.getStreamTypeForMid(stream.mid);

		// Do not add stream types with same 'mid', e.g. type 'screen' becomes type 'video' when deactivated.
		if (!type) {
			this.streamMids.set(this.getStreamTypeForStream(stream), stream.mid);
		}
	}

	private getStreamTypeForMid(mid: string) {
		for (const [k, v] of this.streamMids) {
			if (v === mid) {
				return k;
			}
		}
		return null;
	}

	private getStreamTypeForStream(stream: any) {
		const type: string = stream.type;

		if (type === JanusStreamType.audio || type === JanusStreamType.data) {
			return type;
		}
		else if (type === JanusStreamType.video) {
			// This may be ambiguous, since camera and screen-share are videos.
			// Check the description.
			const description: string = stream.description;

			if (description && description.includes(JanusStreamType.screen)) {
				return JanusStreamType.screen;
			}
			else {
				return JanusStreamType.video;
			}
		}

		return type;
	}

	private getTrackId(track: MediaStreamTrack) {
		return track.id.replace(/[{}]/g, "");
	}

	private createOffer() {
		const videoEnable = this.deviceSettings.videoInput != null && !this.deviceSettings.videoInputMuteOnEntry;
		const videoCapture = videoEnable
			? {
				deviceId: this.deviceSettings.videoInput,
				width: { ideal: 1280 },
				height: { ideal: 720 },
			}
			: false;

		// Publish our stream.
		this.handle.createOffer({
			// Publishers are sendonly.
			tracks: [
				{
					type: JanusStreamType.audio,
					capture: {
						deviceId: this.deviceSettings.audioInput
					},
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
				if (Settings.getMicrophoneMuteOnEntry()) {
					this.handle.muteAudio();
				}

				var publish = {
					request: "configure"
				};

				this.handle.send({ message: publish, jsep: jsep });
			},
			error: (error: any) => {
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
			return;
		}
		else if (track.kind === "video") {
			const mediaElement = document.createElement("video");
			mediaElement.playsInline = true;
			mediaElement.autoplay = true;
			mediaElement.muted = true;

			const stream = new MediaStream();
			stream.addTrack(track);

			this.streams.set(id, stream);

			Janus.attachMediaStream(mediaElement, stream);

			const constraints = track.getConstraints();

			if (constraints.deviceId) {

				console.log("---- add video");

				// Must be a camera device.
				this.view.addVideo(mediaElement);
			}
			else {

				console.log("---- add screen");

				this.view.addScreenVideo(mediaElement);
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
			this.view.removeAudio();
		}
		else if (kind === "video") {
			if (deviceId) {

				console.log("---- remove video");

				// Must be a camera device.
				this.view.removeVideo();
			}
			else {

				console.log("---- remove screen");

				this.view.removeScreenVideo();
			}
		}
	}

	protected override onMuteAudio(mute: boolean) {
		super.onMuteAudio(mute);

		const micMuteAction = new StreamMediaChangeAction(MediaType.Audio, !mute);

		this.handle.data({
			data: micMuteAction.toBuffer(),
			error: function (error: any) { console.error(error) }
		});
	}

	protected override onMuteVideo(mute: boolean) {
		super.onMuteVideo(mute);

		const cameraMid = this.getStreamMid(JanusStreamType.video);

		if (cameraMid) {
			// There is already an active track that can be muted.
			this.muteTrack(cameraMid, !mute, MediaType.Camera);
		}
		else {
			// A new track needs to be added and other participants notified of its existence.
			const captureSettings: MediaTrackConstraints = {
				deviceId: Settings.getCameraId(),
				width: { ideal: 1280 },
				height: { ideal: 720 }
			};

			this.addNewTrack(JanusStreamType.video, captureSettings);
		}
	}

	private addNewTrack(type: JanusStreamType, captureSettings: boolean | MediaTrackConstraints) {
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
				const configure: any = {
					request: "configure"
				};

				// Find the new 'mid' of the newly added track.
				const mids = [...this.streamMids.values()];

				for (let transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
					if (!mids.find(mid => mid === transceiver.mid)) {
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

				this.handle.send({ message: configure, jsep: jsep });
			},
			error: (error: any) => {
				console.error("Add track error", error.name, error);
			}
		});
	}

	private replaceTrack(type: JanusStreamType, captureSettings: boolean | MediaTrackConstraints) {
		// Before we replace the track, we stop and remove the active track.
		const mid = this.getStreamMid(type);

		for (let transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
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
			error: (error: any) => {
				console.error("Replace track error", error);
			}
		});
	}

	private async replaceSenderTrack(transceiver: RTCRtpTransceiver) {
		// Find the Janus track type.
		const type = this.getStreamTypeForMid(transceiver.mid);
		let track;

		if (!type) {
			console.error("No track to replace for mid", transceiver.mid);
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
				this.muteTrack(this.getStreamMid(type), false, MediaType.Screen);
			}
		}

		if (!track) {
			console.error("No track to replace, track is null");
		}

		const trackId = this.getTrackId(track);

		// Set the new active video track.
		await transceiver.sender.replaceTrack(track);

		// Notification of new track.
		this.addTrack(trackId, track);
	}

	private removeSenderTrack(transceiver: RTCRtpTransceiver) {
		const track = transceiver.sender.track;
		const trackId = this.getTrackId(track);

		// Stopping the video track will turn off the active device.
		track.stop();
		// Remove the current video track since we are not sending anything as of now.
		transceiver.sender.replaceTrack(null);

		// Notification of track removal.
		this.removeTrack(trackId, track.kind);
	}

	private async enableTrack(mid: string, enable: boolean) {
		for (let transceiver of this.handle.webrtcStuff.pc.getTransceivers()) {
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
			error: (error: any) => {
				console.error("Create offer error", error);
			}
		});
	}

	private async muteTrack(mid: string, enable: boolean, mediaType: MediaType) {
		this.enableTrack(mid, enable)
			.then(() => {
				const muteAction = new StreamMediaChangeAction(mediaType, enable);

				this.handle.data({
					data: muteAction.toBuffer(),
					error: function (error: any) { console.error(error) }
				});
			})
			.catch(console.error);
	}
}