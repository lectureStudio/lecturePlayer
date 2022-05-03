import { ReactiveController } from 'lit';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;


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

		this.host.addEventListener("player-connection-state", (e: CustomEvent) => {
			this.host.state = e.detail;
		}, false);
	}

	hostDisconnected() {
	}
}