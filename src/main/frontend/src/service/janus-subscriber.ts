import { Janus, JSEP, PluginHandle } from "janus-gateway";
import { JanusParticipant } from "./janus-participant";
import { Utils } from "../utils/utils";
import { State } from "../utils/state";
import { ProgressiveDataView } from "../action/parser/progressive-data-view";
import { StreamActionParser } from "../action/parser/stream.action.parser";
import { StreamMediaChangeAction } from "../action/stream.media.change.action";
import { Devices } from "../utils/devices";
import { GridElement } from "../component/grid-element/grid-element";

export class JanusSubscriber extends JanusParticipant {

	private readonly publisherId: any;

	private readonly roomId: number;

	private readonly opaqueId: string;

	isPrimary = true;


	constructor(janus: Janus, publisherId: any, publisherName: string, roomId: number, opaqueId: string) {
		super(janus);

		this.publisherId = publisherId;
		this.roomId = roomId;
		this.opaqueId = opaqueId;

		this.view.name = publisherName;
		
		document.addEventListener("leaving-room", this.removeGridElement.bind(this));
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
			streams: [{
				feed: this.publisherId
			}]
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
				const streams = message["streams"];

				if (streams) {
					for (const stream of streams) {
						const mid: string = stream["mid"];
						const description: string = stream["feed_description"];

						if (mid && description) {
							this.streamIds.set(mid, description);
						}
					}
				}

				this.setState(State.CONNECTING);
			}
			if (event === "event") {
				const started = message.started;

				if (started === "ok") {
					this.setState(State.CONNECTED);
				}
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

		this.addTrack(mid, track);
	}

	private onData(data: ArrayBuffer | Blob) {		
		if (data instanceof Blob) {
			// Firefox...
			data.arrayBuffer().then(buffer => {
				this.processData(buffer);
			});
		}
		else {
			this.processData(data);
		}

		this.dispatchEvent(Utils.createEvent("janus-participant-data", {
			participant: this,
			data: data
		}));
	}

	private processData(data: ArrayBuffer) {
		const dataView = new ProgressiveDataView(data);
		const length = dataView.getInt32();
		const type = dataView.getInt8();
		
		const action = StreamActionParser.parse(dataView, type, length);

		if (action instanceof StreamMediaChangeAction) {
			this.view.setMediaChange(action.type, action.enabled);
		}
	}

	private createAnswer(jsep: JSEP, wantData: boolean) {
		const media = [];

		if (wantData) {
			// We only specify data channels here, as this way in
			// case they were offered we'll enable them. Since we
			// don't mention audio or video tracks, we autoaccept them
			// as recvonly (since we won't capture anything ourselves).
			media.push({ type: 'data' });
		}

		this.handle.createAnswer({
			jsep: jsep,
			tracks: media,
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

		// Create new audio/video stream.
		let mediaElement = null;
		const isAudio = track.kind === "audio";
		const isVideo = track.kind === "video";

		if (isAudio) {
			mediaElement = document.createElement("audio");
			mediaElement.autoplay = true;
			mediaElement.muted = false;
		}
		else if (isVideo) {
			mediaElement = document.createElement("video");
			mediaElement.playsInline = true;
			mediaElement.autoplay = true;
		}

		// Wire the stream to the media element.
		const stream = new MediaStream();
		stream.addTrack(track.clone());

		this.streams.set(mid, stream);

		Janus.attachMediaStream(mediaElement, stream);

		// Attach the stream to the view.
		if (isAudio) {
			// Set speaker output device.
			if (this.deviceSettings) {
				Devices.setAudioSink(mediaElement, this.deviceSettings.audioOutput);
			}

			this.view.addAudio(mediaElement);
		}
		else if (isVideo) {
			if (this.isScreenTrack(mid)) {
				this.view.addScreenVideo(mediaElement as HTMLVideoElement);
			}
			else {
				this.view.addVideo(mediaElement as HTMLVideoElement);
			}
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

		// Remove media stream from the view.
		if (kind === "audio") {
			this.view.removeAudio();
		}
		else if (kind === "video") {
			if (this.isScreenTrack(mid)) {
				this.view.removeScreenVideo();
			}
			else {
				this.view.removeVideo();
			}
		}
	}

	private isScreenTrack(mid: string): boolean {
		const streamDescription = this.streamIds.get(mid);
		return streamDescription && streamDescription === "screen";
	}

	private removeGridElement(e: CustomEvent) {
		const removingId = this.publisherId;
		if (removingId === this.publisherId) {
			document.dispatchEvent(Utils.createEvent("remove-grid-element", {
				gridElement: this.gridElement
			}))
		}
	}
}