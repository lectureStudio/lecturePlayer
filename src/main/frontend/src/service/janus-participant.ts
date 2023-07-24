import { Janus, PluginHandle } from "janus-gateway";
import { ParticipantView } from "../component/participant-view/participant-view";
import { Devices } from "../utils/devices";
import { DeviceSettings } from "../utils/settings";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { RTCStatsService } from "./rtc-stats.service";

export abstract class JanusParticipant extends EventTarget {

	private statsService: RTCStatsService;

	protected readonly streamIds: Map<string, string>;

	protected readonly janus: Janus;

	protected handle: PluginHandle;

	protected state: State;

	protected deviceSettings: DeviceSettings;

	protected view: ParticipantView;

	protected streams: Map<string, MediaStream>;


	constructor(janus: Janus) {
		super();

		this.streamIds = new Map();

		this.janus = janus;
		this.state = State.DISCONNECTED;
		this.view = new ParticipantView();
		this.streams = new Map();

		this.statsService = new RTCStatsService();

		this.view.addEventListener("participant-mic-mute", this.onMuteAudio.bind(this));
		this.view.addEventListener("participant-cam-mute", this.onMuteVideo.bind(this));
	}

	public abstract connect(): void;

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

	setDeviceSettings(settings: DeviceSettings): void {
		this.deviceSettings = settings;
	}

	getStats() {
		this.statsService.pc = this.handle.webrtcStuff.pc;
		this.statsService.streamIds = this.streamIds;
		this.statsService.getStats();
	}

	protected connected(): void {
		this.handle.webrtcStuff.pc.addEventListener("connectionstatechange", (event) => {
			const peerConnection = this.handle.webrtcStuff.pc;

			if (!peerConnection) {
				// Connection may already be disposed.
				return;
			}

			const connectionState = this.handle.webrtcStuff.pc.connectionState;

			console.log("+ pc connection state", connectionState);

			switch (connectionState) {
				case "connected":
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
					// We cannot recover from a failed connection state.
					this.disconnect();

					this.dispatchEvent(Utils.createEvent("janus-participant-connection-failure", {
						participant: this
					}));
					break;
			}
		}, false);
	}

	protected onMuteAudio() {
		if (this.view.micMute) {
			this.handle.muteAudio();
		}
		else {
			this.handle.unmuteAudio();
		}
	}

	protected onMuteVideo() {
		if (this.view.camMute) {
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
}