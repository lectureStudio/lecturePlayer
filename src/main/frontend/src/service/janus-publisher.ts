import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { JanusParticipant } from "./janus-participant";

export class JanusPublisher extends JanusParticipant {

	private readonly janus: Janus;

	private readonly roomId: number;

	private readonly opaqueId: string;

	private publisherId: any;

	private localStream: MediaStream;


	constructor(janus: Janus, roomId: number, opaqueId: string) {
		super();

		this.janus = janus;
		this.roomId = roomId;
		this.opaqueId = opaqueId;
	}

	connect() {
		this.janus.attach({
			plugin: "janus.plugin.videoroom",
			opaqueId: this.opaqueId,
			success: this.onConnected.bind(this),
			error: this.onError.bind(this),
			consentDialog: (on: boolean) => {
				// e.g., darken the screen if on=true (getUserMedia incoming), restore it otherwise
			},
			iceState: this.onIceState.bind(this),
			mediaState: this.onMediaState.bind(this),
			webrtcState: this.onWebRtcState.bind(this),
			onmessage: this.onMessage.bind(this),
			onlocalstream: this.onLocalStream.bind(this),
			onremotestream: (stream: MediaStream) => {
				// The publisher stream is sendonly, we don't expect anything here.
			},
			oncleanup: this.onCleanUp.bind(this),
			detached: this.onDetached.bind(this)
		});
	}

	private onConnected(handle: PluginHandle) {
		this.handle = handle;

		const subscribe = {
			request: "join",
			ptype: "publisher",
			room: this.roomId,
			display: Janus.randomString(12)
		};

		this.handle.send({ message: subscribe });
	}

	private onMessage(message: any, jsep?: JSEP) {
		const event = message["videoroom"];

		if (message["error"]) {
			Janus.error(message["error"]);
			return;
		}

		if (event) {
			if (event === "joined") {
				this.publisherId = message["id"];
				this.createOffer();
			}
		}

		if (jsep) {
			this.handle.handleRemoteJsep({ jsep: jsep });

			// Check if any of the media we wanted to publish has
			// been rejected (e.g., wrong or unsupported codec)
			const audio = message["audio_codec"];
			const video = message["video_codec"];

			if (this.localStream && this.localStream.getAudioTracks() && this.localStream.getAudioTracks().length > 0 && !audio) {
				// Audio has been rejected
				console.log("Our audio stream has been rejected, viewers won't hear us");
			}

			if (this.localStream && this.localStream.getVideoTracks() && this.localStream.getVideoTracks().length > 0 && !video) {
				// Video has been rejected.

				console.log("Our video stream has been rejected, viewers won't see us");

				// Hide the webcam video

			}
		}
	}

	private onLocalStream(stream: MediaStream) {
		this.localStream = stream;

		let mediaElement = null;

		// if (track.kind === "audio") {
		// 	mediaElement = document.createElement("audio");
		// 	mediaElement.autoplay = true;

		// 	this.view.addAudio(mediaElement);
		// }
		// else if (track.kind === "video") {
		// 	mediaElement = document.createElement("video");
		// 	mediaElement.playsInline = true;
		// 	mediaElement.autoplay = true;

		// 	this.view.addVideo(mediaElement);
		// }

		Janus.attachMediaStream(mediaElement, stream);

		// mediaElement.muted = true;

		const constraints = {
			width: { min: 640, ideal: 640, max: 1280 },
			height: { min: 360, ideal: 360 },
			aspectRatio: { ideal: 1.7777777778 },
			frameRate: { max: 30 },
			facingMode: { ideal: "user" }
		};

		for (const videoTrack of stream.getVideoTracks()) {
			videoTrack.applyConstraints(constraints);
		}
	}

	private createOffer() {
		const useVideo = this.deviceConstraints.videoDeviceId != null;

		// Publish our stream.
		this.handle.createOffer({
			// Publishers are sendonly.
			media: {
				audioRecv: false,
				videoRecv: false,
				audioSend: true,
				videoSend: useVideo,
				audio: {
					deviceId: this.deviceConstraints.audioDeviceId,
					echoCancellation: true
				},
				video: {
					deviceId: this.deviceConstraints.videoDeviceId,
					width: 1280,
					height: 720,
				},
				failIfNoAudio: true,
				failIfNoVideo: false,
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
}