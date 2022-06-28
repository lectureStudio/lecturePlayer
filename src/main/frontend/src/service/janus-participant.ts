import { Janus, PluginHandle } from "janus-gateway";
import { ParticipantView } from "../component/participant-view/participant-view";
import { Devices } from "../utils/devices";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";

export abstract class JanusParticipant extends EventTarget {

	protected handle: PluginHandle;

	protected state: State;

	protected deviceConstraints: any;

	protected view: ParticipantView;

	protected streams: Map<string, MediaStream>;


	constructor() {
		super();

		this.state = State.CONNECTING;
		this.view = new ParticipantView();
		this.streams = new Map();

		this.view.addEventListener("participant-mic-mute", this.onMuteAudio.bind(this));
		this.view.addEventListener("participant-cam-mute", this.onMuteVideo.bind(this));
	}

	setDeviceConstraints(deviceConstraints: any): void {
		this.deviceConstraints = deviceConstraints;
	}

	setAudioSink(element: HTMLMediaElement, audioSink: string) {
		if (!('sinkId' in HTMLMediaElement.prototype)) {
			return;
		}

		element.setSinkId(audioSink)
			.catch(error => {
				console.error(error);
			});
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

		this.setState(isConnected ? State.CONNECTED : State.DISCONNECTED);
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

	protected onIceState(state: 'connected' | 'failed') {
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
		this.state = state;

		this.dispatchEvent(Utils.createEvent("janus-participant-state", {
			participant: this,
			view: this.view,
			state: state
		}));
	}
}