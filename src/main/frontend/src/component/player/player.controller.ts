import { ReactiveController } from 'lit';
import { SpeechService } from '../../service/speech.service';
import { Utils } from '../../utils/utils';
import { SettingsModal } from '../settings-modal/settings-modal';
import { LecturePlayer } from './player';

export class PlayerController implements ReactiveController {

	private readonly host: LecturePlayer;

	private readonly speechService: SpeechService;

	private speechRequestId: string;

	private devicesSelected: boolean;


	constructor(host: LecturePlayer) {
		this.host = host;
		this.host.addController(this);
		this.speechService = new SpeechService();
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
		this.host.addEventListener("player-settings", (e: CustomEvent) => {
			const settingsModal = new SettingsModal();
			settingsModal.open();
		}, false);
		this.host.addEventListener("player-hand-action", (e: CustomEvent) => {
			const handUp = e.detail.handUp;

			if (handUp) {
				this.initSpeech();
			}
			else {
				this.cancelSpeech();
			}
		}, false);
	}

	private initSpeech() {
		if (this.devicesSelected) {
			this.sendSpeechRequest();
		}
		else {
			this.getUserDevices();
		}
	}

	private sendSpeechRequest() {
		this.speechService.requestSpeech(this.host.courseId)
			.then(requestId => {
				this.speechRequestId = requestId;
			})
			.catch(error => console.error(error));
	}

	private cancelSpeech() {
		if (!this.speechRequestId) {
			this.speechCanceled();
			return;
		}

		this.speechService.cancelSpeech(this.host.courseId, this.speechRequestId)
			.then(() => {
				this.speechRequestId = null;
				this.speechCanceled();
			})
			.catch(error => console.error(error));
	}

	private speechCanceled() {
		this.host.dispatchEvent(Utils.createEvent("speech-canceled"));
	}

	private getUserDevices() {
		const settingsModal = new SettingsModal();
		settingsModal.addEventListener("device-settings-canceled", () => {
			this.cancelSpeech();
		});
		settingsModal.addEventListener("device-settings-saved", () => {
			this.devicesSelected = true;
			this.sendSpeechRequest();
		});
		settingsModal.open();
	}
}