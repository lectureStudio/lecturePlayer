import { Janus, JanusRoomParticipant, PluginHandle } from "janus-gateway";
import { ParticipantView } from "../component/participant-view/participant-view";
import { Devices } from "../utils/devices";
import { DeviceSettings } from "../utils/settings";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { RTCStatsService } from "./rtc-stats.service";

export enum JanusStreamType {

	audio = "audio",
	video = "video",
	screen = "screen",
	data = "data"

}

export abstract class JanusParticipant extends EventTarget {

	private readonly reconnectState = {
		attempt: 0,
		attemptsMax: 3,
		timeout: 1500
	};

	private statsService: RTCStatsService;

	private iceConnectionState: RTCIceConnectionState;

	// Janus stream type to mid mapping.
	protected readonly streamMids: Map<string, string>;

	protected readonly janus: Janus;

	protected handle: PluginHandle;

	protected state: State;

	protected deviceSettings: DeviceSettings;

	protected view: ParticipantView;

	protected publishers: Array<JanusRoomParticipant>;

	protected streams: Map<string, MediaStream>;


	constructor(janus: Janus) {
		super();

		this.streamMids = new Map();

		this.janus = janus;
		this.state = State.DISCONNECTED;
		this.view = new ParticipantView();
		this.streams = new Map();
		this.publishers = [];

		this.statsService = new RTCStatsService();

		document.addEventListener("lect-device-mute", this.onMuteDevice.bind(this));
	}

	abstract connect(): void;

	disconnect() {
		this.handle.hangup();
		this.handle.detach();

		this.setState(State.DISCONNECTED);
	}

	setDeviceSettings(settings: DeviceSettings): void {
		this.deviceSettings = settings;
	}

	getStats() {
		this.statsService.pc = this.handle.webrtcStuff.pc;
		this.statsService.streamIds = this.streamMids;
		this.statsService.getStats();
	}

	protected onMuteDevice(event: CustomEvent) {
		const devSetting: MediaDeviceSetting = event.detail;

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

	protected onError(cause: any) {
		Janus.error("WebRTC error: ", cause);

		this.dispatchEvent(Utils.createEvent("janus-participant-error", {
			participant: this,
			error: cause
		}));

		this.reconnectState.attempt++;

		if (this.reconnectState.attempt < this.reconnectState.attemptsMax) {
			// Try again.
			window.setTimeout(this.connect.bind(this), this.reconnectState.timeout);
		}
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

		this.dispatchEvent(Utils.createEvent("janus-participant-destroyed", {
			participant: this
		}));
	}

	protected onIceState(state: "connected" | "failed" | "disconnected" | "closed") {
		Janus.log("ICE state changed to " + state);

		switch (state) {
			case "connected":
				if (this.iceConnectionState === "disconnected") {
					console.log("configure");

					this.handle.send({
						message: {
							request: "configure",
							restart: true
						}
					});

					this.janus.reconnect({
						success: () => {
							console.log("reconnected");
						},
						error: (error: string) => {
							console.error(error);
						}
					});
				}

				this.dispatchEvent(Utils.createEvent("janus-participant-connection-connected", {
					participant: this
				}));
				break;

			case "disconnected":
				this.dispatchEvent(Utils.createEvent("janus-participant-connection-disconnected", {
					participant: this
				}));
				break;

			case "failed":
				this.dispatchEvent(Utils.createEvent("janus-participant-connection-failure", {
					participant: this
				}));
				break;
		}

		this.iceConnectionState = state;
	}

	protected onMediaState(medium: 'audio' | 'video', receiving: boolean, mid?: number) {
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
		this.view.setState(state);

		this.dispatchEvent(Utils.createEvent("janus-participant-state", {
			participant: this,
			view: this.view,
			state: state
		}));
	}

	protected setStream(stream: any) {
		const type = this.getStreamTypeForMid(stream.mid);

		// Do not add stream types with same 'mid', e.g. type 'screen' becomes type 'video' when deactivated.
		if (!type) {
			this.streamMids.set(this.getStreamTypeForStream(stream), stream.mid);
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

	protected getStreamTypeForStream(stream: any) {
		const type: string = stream.type;

		if (type === JanusStreamType.audio || type === JanusStreamType.data) {
			return type;
		}
		else if (type === JanusStreamType.video) {
			// This may be ambiguous, since camera and screen-share are videos.
			// Check the description (publishers), feed_description (subscribers).
			const description: string = stream.description ? stream.description : stream.feed_description;

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