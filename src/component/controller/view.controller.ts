import { autorun } from "mobx";
import { ColorScheme, uiStateStore } from "../../store/ui-state.store";
import { ChatModal } from "../chat-modal/chat.modal";
import { ParticipantsModal } from "../participants-modal/participants.modal";
import { QuizModal } from "../quiz-modal/quiz.modal";
import { SettingsModal } from "../settings-modal/settings.modal";
import { StreamStatsModal } from "../stream-stats-modal/stream-stats.modal";
import { ApplicationContext } from "./context";
import { Controller } from "./controller";
import { RootController } from "./root.controller";
import { LpFullscreenEvent } from "../../event";

interface BreakpointConfig {

	rightContainerVisible: boolean;
	participantsVisible: boolean;

}

export class ViewController extends Controller {

	private readonly colorSchemeQuery: MediaQueryList;

	private readonly compactLayoutQuery: MediaQueryList;

	private breakpointConfig: BreakpointConfig;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		this.eventEmitter.addEventListener("lp-fullscreen", this.onFullscreen.bind(this));
		this.eventEmitter.addEventListener("lp-settings", this.onSettings.bind(this));
		this.eventEmitter.addEventListener("lp-stream-statistics", this.onStatistics.bind(this));
		this.eventEmitter.addEventListener("lp-quiz-visibility", this.onQuizVisibility.bind(this));
		this.eventEmitter.addEventListener("lp-chat-visibility", this.onChatVisibility.bind(this));
		this.eventEmitter.addEventListener("lp-participants-visibility", this.onParticipantsVisibility.bind(this));

		this.breakpointConfig = {
			rightContainerVisible: uiStateStore.rightContainerVisible,
			participantsVisible: uiStateStore.participantsVisible
		};

		if (window.matchMedia) {
			this.colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
			this.colorSchemeQuery.addEventListener("change", event => {
				uiStateStore.setSystemColorScheme(event.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
			});

			uiStateStore.setSystemColorScheme(this.colorSchemeQuery.matches ? ColorScheme.DARK : ColorScheme.LIGHT);
		}

		this.compactLayoutQuery = window.matchMedia("(max-width: 800px) , (orientation: portrait)");
		this.compactLayoutQuery.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};

		autorun(() => {
			this.applyColorScheme();
		});

		console.log("++ color scheme:", uiStateStore.colorScheme, uiStateStore.systemColorScheme);
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
		if (this.compactLayoutQuery.matches) {
			this.onCompactLayout(true);
		}
	}

	applyColorScheme() {
		if (!document.body) {
			return;
		}

		const isDark = uiStateStore.isSystemAndUserDark();

		if (isDark) {
			document.body.classList.add("sl-theme-dark");
		}
		else {
			document.body.classList.remove("sl-theme-dark");
		}
	}

	private onFullscreen(event: LpFullscreenEvent) {
		this.setFullscreen(event.detail === true);
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

	private onQuizVisibility() {
		const quizModal = new QuizModal();

		this.modalController.registerModal("QuizModal", quizModal);
	}

	private onChatVisibility() {
		if (this.compactLayoutQuery.matches) {
			const chatModal = new ChatModal();
			chatModal.chatService = this.chatService;

			this.modalController.registerModal("ChatModal", chatModal);
		}
		else {
			uiStateStore.toggleChatVisible();
		}
	}

	private onParticipantsVisibility() {
		if (this.compactLayoutQuery.matches) {
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
				rightContainerVisible: uiStateStore.rightContainerVisible,
				participantsVisible: uiStateStore.participantsVisible
			};

			// Hide elements.
			uiStateStore.setParticipantsVisible(false);
			uiStateStore.setRightContainerVisible(false);
		}
		else {
			// Re-store state.
			uiStateStore.setRightContainerVisible(this.breakpointConfig.rightContainerVisible);
			uiStateStore.setParticipantsVisible(this.breakpointConfig.participantsVisible);
		}
	}
}