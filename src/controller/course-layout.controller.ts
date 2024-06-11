import { ChatModal } from "../component/chat-modal/chat.modal";
import { ParticipantsModal } from "../component/participants-modal/participants.modal";
import { QuizModal } from "../component/quiz-modal/quiz.modal";
import { ApplicationContext } from "../context/application.context";
import { CourseContext } from "../context/course.context";
import { uiStateStore } from "../store/ui-state.store";

interface BreakpointConfig {

	rightContainerVisible: boolean;
	participantsVisible: boolean;

}

export class CourseLayoutController {

	private readonly applicationContext: ApplicationContext;

	private readonly courseContext: CourseContext;

	private readonly compactLayoutQuery: MediaQueryList;

	private breakpointConfig: BreakpointConfig;


	constructor(context: CourseContext) {
		this.courseContext = context;
		this.applicationContext = context.applicationContext;

		const eventEmitter = context.applicationContext.eventEmitter;

		eventEmitter.addEventListener("lp-quiz-visibility", this.onQuizVisibility.bind(this));
		eventEmitter.addEventListener("lp-chat-visibility", this.onChatVisibility.bind(this));
		eventEmitter.addEventListener("lp-participants-visibility", this.onParticipantsVisibility.bind(this));

		this.breakpointConfig = {
			rightContainerVisible: uiStateStore.rightContainerVisible,
			participantsVisible: uiStateStore.participantsVisible
		};

		this.compactLayoutQuery = window.matchMedia("(max-width: 880px) , (orientation: portrait)");
		this.compactLayoutQuery.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};
	}

	update() {
		if (this.compactLayoutQuery.matches) {
			this.onCompactLayout(true);
		}
	}

	private onQuizVisibility() {
		const quizModal = new QuizModal();

		this.applicationContext.modalController.registerModal("QuizModal", quizModal);
	}

	private onChatVisibility() {
		if (this.compactLayoutQuery.matches) {
			const chatModal = new ChatModal();
			chatModal.chatService = this.courseContext.chatService;

			this.applicationContext.modalController.registerModal("ChatModal", chatModal);
		}
		else {
			uiStateStore.toggleChatVisible();
		}
	}

	private onParticipantsVisibility() {
		if (this.compactLayoutQuery.matches) {
			const participantsModal = new ParticipantsModal();
			participantsModal.moderationService = this.courseContext.moderationService;

			this.applicationContext.modalController.registerModal("ParticipantsModal", participantsModal);
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
