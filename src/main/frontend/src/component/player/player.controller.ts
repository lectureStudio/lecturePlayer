import { ReactiveController } from 'lit';
import { State } from '../../utils/state';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	public state: State = State.CONNECTING;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		this.host.addEventListener("fullscreen", (e: CustomEvent) => {
			if (e.detail.fullscreen === true) {
				if (this.host.requestFullscreen) {
					this.host.requestFullscreen();
				}
			}
			else {
				if (document.exitFullscreen) {
					document.exitFullscreen();
				}
			}
		});

		this.state = State.CONNECTED;
		this.host.requestUpdate();
	}

	hostDisconnected() {
	}
}