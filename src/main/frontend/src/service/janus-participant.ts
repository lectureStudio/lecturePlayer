import { Janus, PluginHandle } from "janus-gateway";
import { ParticipantView } from "../component/participant-view/participant-view";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";

export abstract class JanusParticipant extends EventTarget {

	protected handle: PluginHandle;

	protected state: State;

	protected deviceConstraints: any;

	protected view: ParticipantView;


	constructor() {
		super();

		this.state = State.CONNECTING;
		this.view = new ParticipantView();
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

	protected onCleanUp() {
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