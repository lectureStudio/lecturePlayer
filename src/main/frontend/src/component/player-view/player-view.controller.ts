import { ReactiveController } from "lit";
import { CourseState, CourseStateDocuments, QuizState } from "../../model/course-state";
import { PlaybackService } from "../../service/playback.service";
import { State } from "../../utils/state";
import { ParticipantView } from "../participant-view/participant-view";
import { PlayerView } from "./player-view";

export class PlayerViewController implements ReactiveController {

	private readonly host: PlayerView;

	private readonly playbackService: PlaybackService;


	constructor(host: PlayerView) {
		this.host = host;
		this.host.addController(this);

		this.playbackService = new PlaybackService();
	}

	hostConnected() {
		document.addEventListener("messenger-state", this.onMessengerState.bind(this));
		document.addEventListener("participant-state", this.onParticipantState.bind(this));
		document.addEventListener("quiz-state", this.onQuizState.bind(this));
	}

	getPlaybackService() {
		return this.playbackService;
	}

	getCourseState(): CourseState {
		return this.host.courseState;
	}

	setCourseDocumentState(state: CourseStateDocuments) {
		this.host.courseState = state.courseState;
		this.host.chatVisible = state.courseState.messageFeature !== null;

		setInterval(() => {
			this.host.controls.duration = (Date.now() - this.host.courseState.timeStarted);
		}, 500);

		this.playbackService.initialize(this.host, state.courseState, state.documents);
	}

	private onMessengerState(event: CustomEvent) {
		const started = event.detail.started;
		const featureId = event.detail.featureId;

		if (!this.host.courseState.messageFeature) {
			this.host.courseState.messageFeature = {
				featureId: null
			};
		}

		this.host.courseState.messageFeature.featureId = featureId;
		this.host.controls.hasChat = started;
		this.host.chatVisible = started;
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;

		const started = state.started;

		this.host.courseState.quizFeature = state.feature;
		// this.host.courseState.quizFeature.featureId = featureId;
		// this.host.controls.hasChat = started;
		// this.host.chatVisible = started;
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
}