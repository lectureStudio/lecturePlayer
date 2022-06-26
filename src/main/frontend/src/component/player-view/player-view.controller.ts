import { ReactiveController } from "lit";
import { CourseStateDocuments } from "../../model/course-state";
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
		document.addEventListener("participant-state", this.onParticipantState.bind(this));
	}

	getPlaybackService() {
		return this.playbackService;
	}

	setCourseDocumentState(state: CourseStateDocuments) {
		this.host.courseState = state.courseState;
		this.host.chatVisible = state.courseState.messageFeature !== null;

		setInterval(() => {
			this.host.controls.duration = (Date.now() - this.host.courseState.timeStarted);
		}, 500);

		this.playbackService.initialize(this.host, state.courseState, state.documents);
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