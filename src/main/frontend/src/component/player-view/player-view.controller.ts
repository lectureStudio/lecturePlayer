import { ReactiveController } from "lit";
import { CourseStateDocuments } from "../../model/course-state";
import { PlaybackService } from "../../service/playback.service";
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

	}

	getPlaybackService() {
		return this.playbackService;
	}

	setCourseDocumentState(state: CourseStateDocuments) {
		this.playbackService.initialize(this.host, state.courseState, state.documents);

		this.host.courseState = state.courseState;
		this.host.chatVisible = state.courseState.messageFeature !== null;
	}
}