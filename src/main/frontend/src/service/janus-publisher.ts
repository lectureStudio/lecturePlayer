import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { StreamMediaChangeAction } from "../action/stream.media.change.action";
import { course } from "../model/course";
import { MediaType } from "../model/media-type";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { JanusParticipant } from "./janus-participant";

export class JanusPublisher extends JanusParticipant {

	private readonly roomId: number;

	private readonly opaqueId: string;

	private publisherId: bigint;

	private publisherName: string;


	constructor(janus: Janus, roomId: number, opaqueId: string, publisherName: string) {
		super(janus);

		this.roomId = roomId;
		this.opaqueId = opaqueId;
		this.view.isLocal = true;
		this.publisherName = publisherName;
		this.view.name = publisherName;

		document.addEventListener("controls-mic-mute", this.onControlsMuteMic.bind(this));
		document.addEventListener("controls-cam-mute", this.onControlsMuteCam.bind(this));
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
		
		console.log("joining")
	
		this.handle = handle;

		const subscribe = {
			request: "join",
			ptype: "publisher",
			room: this.roomId,
			display: this.publisherName ? this.publisherName : course.userId
		};

		this.handle.send({ message: subscribe });
	}

	private onMessage(message: any, jsep?: JSEP) {
		const event = message["videoroom"];

		if (message["error"]) {
			Janus.error(message["error"]);
			return;
		}
		if (message["unpublished"]) {
			var unpublished = message["unpublished"];

			if (unpublished === "ok") {
				// That's us.
				this.handle.hangup();
				return;
			}
		}

		if (event) {
			if (event === "joined") {
				this.publisherId = BigInt(message["id"]);

				this.createOffer();
				this.setState(State.CONNECTING);
			}
	
			if (event === "event") {
				const configured = message.configured;
				const publishers = message.publishers;
				const leaving = message.leaving;

				if (publishers) {
					for (let publisher of publishers) {
						this.dispatchEvent(Utils.createEvent("publisher-room", publisher));
					}
				}

				if (leaving) {
					console.log(leaving)
					document.dispatchEvent(Utils.createEvent("leaving-room", leaving));
				}

				if (configured === "ok") {
					this.setState(State.CONNECTED);
				}
			}

			if (event === "talking") {
				this.view.isTalking = true;
				document.dispatchEvent(Utils.createEvent("publisher-talking", this.gridElement));
			} else if (event === "stopped-talking") {
				this.view.isTalking = false;
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
		var trackId = track.id.replace(/[{}]/g, "");

		if (!active) {
			this.removeTrack(trackId, track.kind);
			return;
		}

		this.addTrack(trackId, track);
	}

	private createOffer() {
		const useVideo = this.deviceSettings.videoInput != null;

		// Publish our stream.
		this.handle.createOffer({
			// Publishers are sendonly.
			media: {
				audioRecv: false,
				videoRecv: false,
				audioSend: true,
				videoSend: useVideo,
				audio: {
					deviceId: this.deviceSettings.audioInput
				},
				video: {
					deviceId: this.deviceSettings.videoInput,
					width: 1280,
					height: 720,
				},
				failIfNoAudio: true,
				failIfNoVideo: false,
				data: true
			},
			success: (jsep: JSEP) => {
				Janus.debug("Got publisher SDP!", jsep);

				var publish = {
					request: "configure",
					audio: true,
					video: useVideo
				};

				// if(acodec)
				// 	publish["audiocodec"] = acodec;
				// if(vcodec)
				// 	publish["videocodec"] = vcodec;

				this.handle.send({ message: publish, jsep: jsep });
			},
			error: (error: any) => {
				Janus.error("WebRTC error:", error);
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
			stream.addTrack(track.clone());

			this.streams.set(id, stream);

			Janus.attachMediaStream(mediaElement, stream);

			this.view.addVideo(mediaElement);
		}
	}

	private removeTrack(id: string, kind: string) {
		const stream = this.streams.get(id);

		if (!stream) {
			return;
		}

		for (const track of stream.getTracks()) {
			if (track.kind === kind) {
				track.stop();
			}
		}

		this.streams.delete(id);

		if (kind === "audio") {
			this.view.removeAudio();
		}
		else if (kind === "video") {
			this.view.removeVideo();
		}
	}

	protected onControlsMuteCam(): void {
		const camMuted = this.view.camMute;
		this.view.setMediaChange(MediaType.Camera, camMuted);
		this.onMuteVideo();

		const camMuteAction = new StreamMediaChangeAction(MediaType.Camera, !camMuted);
		
		this.handle.data({
			data: camMuteAction.toBuffer(),
			error: function (error: any) { console.log(error) },
			success: function () { console.log("camera state changed") },
		});
	}

	protected onControlsMuteMic(): void {
		const micMuted = this.view.micMute;
		this.view.setMediaChange(MediaType.Audio, micMuted);
		this.onMuteAudio();

		const micMuteAction = new StreamMediaChangeAction(MediaType.Audio, !micMuted);
		
		this.handle.data({
			data: micMuteAction.toBuffer(),
			error: function (error: any) { console.log(error) },
			success: function () { console.log("microphone state changed") },
		});
	}
}