import { ReactiveController } from "lit";
import { CourseState, MessengerState, QuizState } from "../../model/course-state";
import { State } from "../../utils/state";
import { Utils } from "../../utils/utils";
import { ParticipantView } from "../participant-view/participant-view";
import { PlayerView } from "./player-view";

export class PlayerViewController implements ReactiveController {

	readonly host: PlayerView;

	private clockIntervalId: number;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		document.addEventListener("messenger-state", this.onMessengerState.bind(this));
		document.addEventListener("participant-state", this.onParticipantState.bind(this));
		document.addEventListener("quiz-state", this.onQuizState.bind(this));

		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
	}

	setCourseState(courseState: CourseState) {
		this.host.courseState = Utils.mergeDeep(this.host.courseState || {}, courseState);
		this.host.chatVisible = this.host.courseState.messageFeature != null;

		this.clockIntervalId = window.setInterval(() => {
			try {
				this.host.controls.duration = (Date.now() - this.host.courseState.timeStarted);
			}
			catch (error) {
				clearInterval(this.clockIntervalId);
			}
		}, 500);
	}

	setDisconnected() {
		clearInterval(this.clockIntervalId);

		this.host.courseState = null;
		this.host.controls.handUp = false;
		this.host.controls.fullscreen = false;
	}

	private onMessengerState(event: CustomEvent) {
		const state: MessengerState = event.detail;
		const started = state.started;

		this.host.courseState = {
			...this.host.courseState,
			...{
				messageFeature: started ? state.feature : null
			}
		};
		this.host.chatVisible = started;
		this.host.requestUpdate();
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;
		const started = state.started;

		this.host.courseState = {
			...this.host.courseState,
			...{
				quizFeature: started ? state.feature : null
			}
		};
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
		this.host.chatVisible = !this.host.chatVisible;
	}
}