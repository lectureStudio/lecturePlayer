import { ReactiveController } from "lit";
import { MessengerState, QuizState } from "../../model/course-state";
import { PlayerFeatureView } from "./feature-view";

export class FeatureViewController implements ReactiveController {

	private readonly host: PlayerFeatureView;


	constructor(host: PlayerFeatureView) {
		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		document.addEventListener("messenger-state", this.onMessengerState.bind(this));
		document.addEventListener("quiz-state", this.onQuizState.bind(this));
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
}