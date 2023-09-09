import Janus from "janus-gateway";
import { Devices } from "../utils/devices";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { RTCStatsService } from "./rtc-stats.service";
import { EventEmitter } from "../utils/event-emitter";
import { TypedEventTarget } from "typescript-event-target";
import { LpDeviceMuteEvent, ParticipantConnectionState, ParticipantError, ParticipantState } from "../event";

export enum JanusStreamType {

	audio = "audio",
	video = "video",
	screen = "screen",
	data = "data"

}

export abstract class JanusParticipant extends TypedEventTarget<DocumentEventMap> {

	private statsService: RTCStatsService;

	protected readonly eventEmitter: EventEmitter;

	// Janus stream type to mid mapping.
	protected readonly streamMids: Map<string, string>;

	protected readonly janus: Janus;

	protected handle: PluginHandle;

	protected state: State;

	protected publishers: Array<VideoRoomParticipant>;

	protected streams: Map<string, MediaStream>;


	constructor(janus: Janus, eventEmitter: EventEmitter) {
		super();

		this.streamMids = new Map();

		this.janus = janus;
		this.eventEmitter = eventEmitter;
		this.state = State.DISCONNECTED;
		this.streams = new Map();
		this.publishers = [];

		this.statsService = new RTCStatsService();

		this.eventEmitter.addEventListener("lp-device-mute", this.onMuteDevice.bind(this));
	}

	abstract connect(): void;

	reconnect() {
		// Proactively keep connection alive.
		this.janus.reconnect({
			success: () => {
				console.log("~ janus reconnected", this.janus.isConnected());
			},
			error: (error: string) => {
				console.error(error);
			}
		});
	}

	disconnect() {
		this.handle.hangup(true);
		this.handle.detach();

		this.setState(State.DISCONNECTED);
	}

	getStats() {
		this.statsService.pc = this.handle.webrtcStuff.pc;
		this.statsService.streamIds = new Map(Array.from(this.streamMids, entry => [entry[1], entry[0]]));
		this.statsService.getStats();
	}

	protected connected(): void {
		this.handle.webrtcStuff.pc.addEventListener("connectionstatechange", (_event) => {
			const peerConnection = this.handle.webrtcStuff.pc;

			if (!peerConnection) {
				// Connection may already be disposed.
				return;
			}

			const connectionState = this.handle.webrtcStuff.pc.connectionState;

			console.log("+ pc connection state", connectionState);

			this.dispatchEvent(Utils.createEvent<ParticipantConnectionState>("lp-participant-connection-state", {
				participant: this,
				state: connectionState
			}));

			if (connectionState === "failed") {
				// We cannot recover from a failed connection state.
				this.disconnect();
			}
		}, false);
	}

	protected onMuteDevice(event: LpDeviceMuteEvent) {
		const devSetting = event.detail;

		if (devSetting.kind === "audioinput") {
			this.onMuteAudio(devSetting.muted);
		}
		else if (devSetting.kind === "videoinput") {
			this.onMuteVideo(devSetting.muted);
		}
	}

	protected onMuteAudio(mute: boolean) {
		if (mute) {
			this.handle.muteAudio();
		}
		else {
			this.handle.unmuteAudio();
		}
	}

	protected onMuteVideo(mute: boolean) {
		if (mute) {
			this.handle.muteVideo();
		}
		else {
			this.handle.unmuteVideo();
		}
	}

	protected onError(cause: unknown) {
		Janus.error("WebRTC error: ", cause);

		this.dispatchEvent(Utils.createEvent<ParticipantError>("lp-participant-error", {
			participant: this,
			cause: cause
		}));
	}

	protected onWebRtcState(isConnected: boolean) {
		Janus.log("Janus says our WebRTC PeerConnection is " + (isConnected ? "up" : "down") + " now");

		if (!isConnected) {
			this.setState(State.DISCONNECTED);
		}
	}

	protected onSlowLink(uplink: boolean, lost: number, mid: string) {
		Janus.warn("Janus reports problems " + (uplink ? "sending" : "receiving") + " " + mid + " packets");
	}

	protected onCleanUp() {
		this.streams.forEach(stream => Devices.stopMediaTracks(stream));
		this.streams.clear();

		this.dispatchEvent(Utils.createEvent<JanusParticipant>("lp-participant-destroyed", this));
	}

	protected onIceState(state: "connected" | "failed" | "disconnected" | "closed") {
		Janus.log("ICE state changed to " + state);
	}

	protected onMediaState(medium: 'audio' | 'video', receiving: boolean) {
		Janus.log("Janus " + (receiving ? "started" : "stopped") + " receiving our " + medium);
	}

	protected onDataOpen(label: string, protocol: string) {
		Janus.log("The DataChannel is available!" + " - " + label + " - " + protocol);
	}

	protected onDetached() {
		Janus.log("detached...");
	}

	protected setState(state: State) {
		if (this.state === state) {
			return;
		}

		this.state = state;

		this.dispatchEvent(Utils.createEvent<ParticipantState>("lp-participant-state", {
			participant: this,
			state: state
		}));
	}

	protected setStream(stream: JanusStreamDescription) {
		const type = this.getStreamTypeForMid(stream.mid);

		// Do not add stream types with same 'mid', e.g. type 'screen' becomes type 'video' when deactivated.
		if (!type) {
			const streamType = this.getStreamTypeForStream(stream);

			if (streamType) {
				this.streamMids.set(streamType, stream.mid);
			}
		}
	}

	protected getStreamMid(type: JanusStreamType) {
		return this.streamMids.get(type);
	}

	protected getStreamTypeForMid(mid: string) {
		for (const [k, v] of this.streamMids) {
			if (v === mid) {
				return k;
			}
		}
		return null;
	}

	protected getStreamTypeForStream(stream: JanusStreamDescription) {
		const type = stream.type;

		if (type === JanusStreamType.audio || type === JanusStreamType.data) {
			return type;
		}
		else if (type === JanusStreamType.video) {
			// This may be ambiguous, since camera and screen-share are videos.
			// Check the description (publishers), feed_description (subscribers).
			const description = stream.description ? stream.description : stream.feed_description;

			if (description && description.includes(JanusStreamType.screen)) {
				return JanusStreamType.screen;
			}
			else {
				return JanusStreamType.video;
			}
		}

		return type;
	}
}