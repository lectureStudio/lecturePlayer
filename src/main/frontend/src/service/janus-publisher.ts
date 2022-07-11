import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { State } from "../utils/state";
import { JanusParticipant } from "./janus-participant";

export class JanusPublisher extends JanusParticipant {

	private readonly janus: Janus;

	private readonly roomId: number;

	private readonly opaqueId: string;

	private publisherId: bigint;


	constructor(janus: Janus, roomId: number, opaqueId: string) {
		super();

		this.janus = janus;
		this.roomId = roomId;
		this.opaqueId = opaqueId;
		this.view.isLocal = true;
	}

	connect() {
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

	disconnect() {
		const unpublish = { request: "unpublish" };

		this.handle.send({ message: unpublish });
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
					deviceId: this.deviceConstraints.audioDeviceId
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

			this.view.addVideo(mediaElement);

			const stream = new MediaStream();
			stream.addTrack(track.clone());

			this.streams.set(id, stream);

			Janus.attachMediaStream(mediaElement, stream);
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
}