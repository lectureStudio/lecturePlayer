import { ReactiveController } from "lit";
import { State } from "../../utils/state";
import { ParticipantView } from "../participant-view/participant-view";
import { PlayerView } from "./player-view";
import { course } from '../../model/course';
import { PlayerController } from "../player/player.controller";

interface BreakpointConfig {

	chatVisible: boolean;
	participantsVisible: boolean;

}

export class PlayerViewController implements ReactiveController {

	private readonly maxWidth576Query: MediaQueryList;

	private playerController: PlayerController;

	private breakpointConfig: BreakpointConfig;

	readonly host: PlayerView;

	private clockIntervalId: number;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);

		this.maxWidth576Query = window.matchMedia("(max-width: 576px)");
		this.maxWidth576Query.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};
	}

	hostConnected() {
		course.addEventListener("course-chat-feature", this.onChatState.bind(this));
		course.addEventListener("course-quiz-feature", this.onQuizState.bind(this));

		document.addEventListener("participant-state", this.onParticipantState.bind(this));

		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.host.addEventListener("player-participants-visibility", this.onParticipantsVisibility.bind(this), false);

		this.host.chatVisible = course.chatFeature != null;

		this.breakpointConfig = {
			chatVisible: this.host.chatVisible,
			participantsVisible: this.host.participantsVisible
		};
	}

	update() {
		if (this.maxWidth576Query.matches) {
			this.onCompactLayout(true);
		}

		this.clockIntervalId = window.setInterval(() => {
			try {
				this.host.controls.duration = (Date.now() - course.timeStarted);
			}
			catch (error) {
				window.clearInterval(this.clockIntervalId);
			}
		}, 500);
	}

	getPlayerController() {
		return this.playerController;
	}

	setPlayerController(controller: PlayerController) {
		this.playerController = controller;
	}

	setDisconnected() {
		window.clearInterval(this.clockIntervalId);

		this.host.cleanup();
	}

	private onChatState() {
		this.host.chatVisible = course.chatFeature != null;
		this.host.requestUpdate();
	}

	private onQuizState() {
		this.host.requestUpdate();
	}

	private onParticipantState(event: CustomEvent) {
		const view: ParticipantView = event.detail.view;
		const state: State = event.detail.state;

		if (state === State.CONNECTING) {
			this.host.addParticipant(view);
		}
		else if (state === State.DISCONNECTED) {
			this.host.removeParticipant(view);
		}
	}

	private onChatVisibility() {
		if (!this.maxWidth576Query.matches) {
			this.host.chatVisible = !this.host.chatVisible;
		}
	}

	private onParticipantsVisibility() {
		if (!this.maxWidth576Query.matches) {
			this.host.participantsVisible = !this.host.participantsVisible;
		}
	}

	private onCompactLayout(compact: boolean) {
		if (compact) {
			// Store current (visible) state.
			this.breakpointConfig = {
				chatVisible: this.host.chatVisible,
				participantsVisible: this.host.participantsVisible
			};

			// Hide elements.
			this.host.chatVisible = false;
			this.host.participantsVisible = false;
		}
		else {
			// Re-store state.
			this.host.chatVisible = this.breakpointConfig.chatVisible;
			this.host.participantsVisible = this.breakpointConfig.participantsVisible;
		}
	}
}