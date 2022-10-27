import { Janus, PluginHandle } from "janus-gateway";
import { ParticipantView } from "../component/participant-view/participant-view";
import { Devices } from "../utils/devices";
import { DeviceSettings } from "../utils/settings";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";

export abstract class JanusParticipant extends EventTarget {

	private readonly reconnectState = {
		attempt: 0,
		attemptsMax: 3,
		timeout: 1500
	};

	protected readonly janus: Janus;

	protected handle: PluginHandle;

	protected state: State;

	protected deviceSettings: DeviceSettings;

	protected view: ParticipantView;

	protected streams: Map<string, MediaStream>;

	private iceConnectionState: RTCIceConnectionState;


	constructor(janus: Janus) {
		super();

		this.janus = janus;
		this.state = State.DISCONNECTED;
		this.view = new ParticipantView();
		this.streams = new Map();

		this.view.addEventListener("participant-mic-mute", this.onMuteAudio.bind(this));
		this.view.addEventListener("participant-cam-mute", this.onMuteVideo.bind(this));
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
}