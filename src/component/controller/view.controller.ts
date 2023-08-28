import { uiStateStore } from "../../store/ui-state.store";
import { ChatModal } from "../chat-modal/chat.modal";
import { ParticipantsModal } from "../participants-modal/participants.modal";
import { QuizModal } from "../quiz-modal/quiz.modal";
import { SettingsModal } from "../settings-modal/settings.modal";
import { StreamStatsModal } from "../stream-stats-modal/stream-stats.modal";
import { ApplicationContext } from "./context";
import { Controller } from "./controller";
import { RootController } from "./root.controller";

interface BreakpointConfig {

	chatVisible: boolean;
	participantsVisible: boolean;

}

export class ViewController extends Controller {

	private readonly maxWidth576Query: MediaQueryList;

	private breakpointConfig: BreakpointConfig;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		this.eventEmitter.addEventListener("player-fullscreen", this.onFullscreen.bind(this));
		this.eventEmitter.addEventListener("player-settings", this.onSettings.bind(this), false);
		this.eventEmitter.addEventListener("player-statistics", this.onStatistics.bind(this), false);
		this.eventEmitter.addEventListener("player-quiz-action", this.onQuizAction.bind(this), false);
		this.eventEmitter.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
		this.eventEmitter.addEventListener("player-participants-visibility", this.onParticipantsVisibility.bind(this), false);

		this.breakpointConfig = {
			chatVisible: uiStateStore.chatVisible,
			participantsVisible: uiStateStore.participantsVisible
		};

		this.maxWidth576Query = window.matchMedia("(max-width: 575px) , (orientation: portrait)");
		this.maxWidth576Query.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};
	}

	setFullscreen(enable: boolean) {
		const isFullscreen = document.fullscreenElement !== null;

		if (enable) {
			if (this.context.host.requestFullscreen && !isFullscreen) {
				this.context.host.requestFullscreen();
			}
		}
		else {
			if (document.exitFullscreen && isFullscreen) {
				document.exitFullscreen();
			}
		}
	}

	update() {
		if (this.maxWidth576Query.matches) {
			this.onCompactLayout(true);
		}
	}

	private onFullscreen(event: CustomEvent) {
		this.setFullscreen(event.detail.fullscreen === true);
	}

	private onSettings() {
		const settingsModal = new SettingsModal();

		this.modalController.registerModal("SettingsModal", settingsModal);
	}

	private onStatistics() {
		const statisticsModal = new StreamStatsModal();
		statisticsModal.eventEmitter = this.eventEmitter;

		this.modalController.registerModal("StreamStatsModal", statisticsModal);
	}

	private onQuizAction() {
		const quizModal = new QuizModal();

		this.modalController.registerModal("QuizModal", quizModal);
	}

	private onChatVisibility() {
		if (this.maxWidth576Query.matches) {
			const chatModal = new ChatModal();
			chatModal.chatService = this.chatService;

			this.modalController.registerModal("ChatModal", chatModal);
		}
		else {
			uiStateStore.toggleChatVisible();
		}
	}

	private onParticipantsVisibility() {
		if (this.maxWidth576Query.matches) {
			const participantsModal = new ParticipantsModal();

			this.modalController.registerModal("ParticipantsModal", participantsModal);
		}
		else {
			uiStateStore.toggleParticipantsVisible();
		}
	}

	private onCompactLayout(compact: boolean) {
		if (compact) {
			// Store current (visible) state.
			this.breakpointConfig = {
				chatVisible: uiStateStore.chatVisible,
				participantsVisible: uiStateStore.participantsVisible
			};

			// Hide elements.
			uiStateStore.setChatVisible(false);
			uiStateStore.setParticipantsVisible(false);
		}
		else {
			// Re-store state.
			uiStateStore.setChatVisible(this.breakpointConfig.chatVisible);
			uiStateStore.setParticipantsVisible(this.breakpointConfig.participantsVisible);
		}
	}
}