import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { JanusParticipant } from "./janus-participant";
import { Utils } from "../utils/utils";
import { State } from "../utils/state";

export class JanusSubscriber extends JanusParticipant {

	private readonly janus: Janus;

	private readonly publisherId: any;

	private readonly roomId: number;

	private readonly opaqueId: string;

	isPrimary = false;


	constructor(janus: Janus, publisherId: any, roomId: number, opaqueId: string) {
		super();

		this.janus = janus;
		this.publisherId = publisherId;
		this.roomId = roomId;
		this.opaqueId = opaqueId;
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
			onremotetrack: this.onRemoteTrack.bind(this),
			ondataopen: this.onDataOpen.bind(this),
			ondata: this.onData.bind(this),
			oncleanup: this.onCleanUp.bind(this),
			ondetached: this.onDetached.bind(this)
		});
	}

	private onConnected(handle: PluginHandle) {
		this.handle = handle;

		const subscribe = {
			request: "join",
			ptype: "subscriber",
			room: this.roomId,
			feed: this.publisherId
		};

		this.handle.send({ message: subscribe });
	}

	private onMessage(message: any, jsep?: JSEP) {
		const event = message["videoroom"];

		if (message["error"]) {
			this.onError(message["error"]);
			return;
		}

		if (event) {
			if (event === "attached") {
				// Subscriber created and attached.
				Janus.log("Successfully attached to feed " + message["id"] + " (" + message["display"] + ") in room " + message["room"]);

				this.setState(State.CONNECTING);
			}
		}

		if (jsep) {
			this.createAnswer(jsep, this.isPrimary);
		}
	}

	private onRemoteTrack(track: MediaStreamTrack, mid: string, active: boolean) {
		if (!active) {
			this.removeTrack(mid, track.kind);
			return;
		}

		this.handle.webrtcStuff.remoteStream.addEventListener('removetrack', (event) => {
			// This event listener is faster than the default one.
			if (event.track.kind === "audio") {
				this.view.removeAudio();
			}
			else if (event.track.kind === "video") {
				this.view.removeVideo();
			}
		});

		this.addTrack(mid, track);
	}

	private onData(data: ArrayBuffer | Blob) {
		this.dispatchEvent(Utils.createEvent("janus-participant-data", {
			participant: this,
			data: data
		}));
	}

	private createAnswer(jsep: JSEP, wantData: boolean) {
		this.handle.createAnswer({
			jsep: jsep,
			media: { audioSend: false, videoSend: false, data: wantData },	// We want recvonly audio/video.
			success: (jsep: JSEP) => {
				const body = {
					request: "start",
					room: this.roomId
				};

				this.handle.send({ message: body, jsep: jsep });
			},
			error: (error: any) => {
				this.onError(error);
			}
		});
	}

	private addTrack(mid: string, track: MediaStreamTrack) {
		if (this.streams.has(mid)) {
			// Do not add duplicate tracks.
			return;
		}

		let mediaElement = null;

		if (track.kind === "audio") {
			mediaElement = document.createElement("audio");
			mediaElement.autoplay = true;

			this.view.addAudio(mediaElement);
		}
		else if (track.kind === "video") {
			mediaElement = document.createElement("video");
			mediaElement.playsInline = true;
			mediaElement.autoplay = true;

			this.view.addVideo(mediaElement);
		}

		const stream = new MediaStream();
		stream.addTrack(track.clone());

		this.streams.set(mid, stream);

		Janus.attachMediaStream(mediaElement, stream);

		if (this.deviceConstraints) {
			this.setAudioSink(mediaElement, this.deviceConstraints.audioOutput);
		}
	}

	private removeTrack(mid: string, kind: string) {
		const stream = this.streams.get(mid);

		if (!stream) {
			return;
		}

		for (const track of stream.getTracks()) {
			if (track.kind === kind) {
				track.stop();
			}
		}

		this.streams.delete(mid);

		if (kind === "audio") {
			this.view.removeAudio();
		}
		else if (kind === "video") {
			this.view.removeVideo();
		}
	}
}