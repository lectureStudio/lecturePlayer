import { Janus, JanusMessage, JanusStreamDescription, JSEP, PluginHandle } from "janus-gateway";
import { JanusParticipant, JanusStreamType } from "./janus-participant";
import { Utils } from "../utils/utils";
import { State } from "../utils/state";
import { participantStore } from "../store/participants.store";

export class JanusSubscriber extends JanusParticipant {

	private readonly publisherId: bigint;

	private readonly publisherUserId: string;

	private readonly roomId: number;

	private readonly opaqueId: string;


	constructor(janus: Janus, publisherId: bigint, publisherUserId: string, roomId: number, opaqueId: string) {
		super(janus);

		this.publisherId = publisherId;
		this.publisherUserId = publisherUserId;
		this.roomId = roomId;
		this.opaqueId = opaqueId;
	}

	getPublisherId() {
		return this.publisherId;
	}

	getPublisherUserId() {
		return this.publisherUserId;
	}

	updateStreams(streams: JanusStreamDescription[]) {
		if (!streams) {
			return;
		}

		for (const stream of streams) {
			if (!this.getStreamTypeForMid(stream.mid)) {
				// Not subscribed to this stream yet.
				this.subscribeStream(stream);
			}
		}
	}

	setReceiveCameraFeed(receive: boolean) {
		const mid = this.streamMids.get("video");

		if (!mid) {
			console.error("Stream mid not found");
			return;
		}

		if (receive) {
			this.subscribeStream({ mid: mid });
		}
		else {
			this.unsubscribeStream({ mid: mid });
		}
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

	override disconnect() {
		super.disconnect();
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

	private onMessage(message: JanusMessage, jsep?: JSEP) {
		console.log("message sub", message);

		const event = message["videoroom"];

		if (message["error"]) {
			this.onError(message["error"]);
			return;
		}

		if (event) {
			if (event === "attached") {
				// Subscriber created and attached.
				const streams = message["streams"];

				this.setStreamIds(streams);

				this.setState(State.CONNECTING);
			}
			if (event === "updated") {
				const streams = message["streams"];

				this.setStreamIds(streams);
				
				console.log("streamMids sub", this.streamMids);
			}
			if (event === "event") {
				const started = message.started;

				if (started === "ok") {
					this.connected();
					this.setState(State.CONNECTED);
				}
			}
		}

		if (jsep) {
			this.createAnswer(jsep, true);
		}
	}

	private setStreamIds(streams: JanusStreamDescription[] | undefined) {
		if (streams) {
			for (const stream of streams) {
				this.setStream(stream);
			}
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
		this.dispatchEvent(Utils.createEvent("janus-participant-data", {
			participant: this,
			data: data
		}));
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
			error: (error: unknown) => {
				this.onError(error);
			}
		});
	}

	private subscribeStream(stream: JanusStreamDescription) {
		// console.log("subscribe to stream", stream);

		const message = {
			request: "subscribe",
			streams: [
				{
					feed: this.publisherId,
					mid: stream.mid
				}
			]
		};

		this.handle.send({ message: message });
	}

	private unsubscribeStream(stream: JanusStreamDescription) {
		// console.log("unsubscribe from stream", stream);

		const message = {
			request: "unsubscribe",
			streams: [
				{
					feed: this.publisherId,
					mid: stream.mid
				}
			]
		};

		this.handle.send({ message: message });
	}

	private addTrack(mid: string, track: MediaStreamTrack) {
		if (this.streams.has(mid)) {
			// Do not add duplicate tracks.
			return;
		}

		// Create new audio/video stream.
		const isAudio = track.kind === "audio";
		const isVideo = track.kind === "video";

		// Wire the stream to the media element.
		const stream = new MediaStream();
		stream.addTrack(track.clone());

		this.streams.set(mid, stream);

		if (isAudio) {
			participantStore.setParticipantMicrophoneStream(this.getPublisherUserId(), stream);
		}
		else if (isVideo) {
			const type = this.getStreamTypeForMid(mid);

			if (type === JanusStreamType.screen) {

				// console.log("---- sub add screen");

				participantStore.setParticipantScreenStream(this.getPublisherUserId(), stream);

				document.dispatchEvent(Utils.createEvent("screen-share-block", {
					screenSharing: true
				}));
			}
			else if (type === JanusStreamType.video) {

				// console.log("---- sub add video");

				participantStore.setParticipantCameraStream(this.getPublisherUserId(), stream);
			}
		}
	}

	private removeTrack(mid: string, kind: string) {
		// console.log("---- sub remove track", mid);

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
			participantStore.removeParticipantMicrophoneStream(this.getPublisherUserId());
		}
		else if (kind === "video") {
			const type = this.getStreamTypeForMid(mid);

			if (type === JanusStreamType.screen) {

				// console.log("---- sub remove screen");

				participantStore.removeParticipantScreenStream(this.getPublisherUserId());

				document.dispatchEvent(Utils.createEvent("screen-share-block", {
					screenSharing: false
				}));
			}
			else if (type === JanusStreamType.video) {

				// console.log("---- sub remove video");

				participantStore.removeParticipantCameraStream(this.getPublisherUserId());
			}
		}
	}
}