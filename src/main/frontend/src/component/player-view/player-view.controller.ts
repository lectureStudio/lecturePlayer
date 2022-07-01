import { ReactiveController } from "lit";
import { CourseState, CourseStateDocuments, MessengerState, QuizState } from "../../model/course-state";
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

		this.host.addEventListener("player-chat-visibility", this.onChatVisibility.bind(this), false);
	}

	getPlaybackService() {
		return this.playbackService;
	}

	getCourseState(): CourseState {
		return this.host.courseState;
	}

	setCourseDocumentState(state: CourseStateDocuments) {
		this.host.courseState = state.courseState;
		this.host.chatVisible = state.courseState.messageFeature != null;

		setInterval(() => {
			this.host.controls.duration = (Date.now() - this.host.courseState.timeStarted);
		}, 500);

		this.playbackService.initialize(this.host, state.courseState, state.documents);
	}

	private onMessengerState(event: CustomEvent) {
		const state: MessengerState = event.detail;
		const started = state.started;

		this.host.courseState.messageFeature = started ? state.feature : null;
		this.host.chatVisible = started;
		this.host.requestUpdate();
	}

	private onQuizState(event: CustomEvent) {
		const state: QuizState = event.detail;
		const started = state.started;

		this.host.courseState.quizFeature = started ? state.feature : null;
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