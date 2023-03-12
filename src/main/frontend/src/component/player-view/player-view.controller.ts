import { ReactiveController } from "lit";
import { State } from "../../utils/state";
import { PlayerView } from "./player-view";

export class PlayerViewController implements ReactiveController {

	readonly host: PlayerView;

	private clockIntervalId: number;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		// document.addEventListener("participant-state", this.onParticipantState.bind(this));
	}

	update() {
		
	}

	setDisconnected() {
		window.clearInterval(this.clockIntervalId);

		this.host.cleanup();
	}

	private onParticipantState(event: CustomEvent) {
		const state: State = event.detail.state;

		if (state === State.CONNECTING) {
			
		}
		else if (state === State.DISCONNECTED) {
			
		}
	}
}