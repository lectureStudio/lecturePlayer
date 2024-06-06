import { ReactiveController } from 'lit';
import { EventService } from '../../service/event.service';
import { ChatService } from '../../service/chat.service';
import { ModerationService } from "../../service/moderation.service";
import { courseStore } from "../../store/course.store";
import { uiStateStore } from "../../store/ui-state.store";
import { LecturePlayer } from './player';
import { ApplicationContext } from '../controller/context';
import { EventEmitter } from '../../utils/event-emitter';
import { RootController } from '../controller/root.controller';
import { Controller } from '../controller/controller';
import {
	LpChatStateEvent,
	LpEventServiceStateEvent,
	LpQuizStateEvent,
	LpRecordingStateEvent,
	LpStreamStateEvent,
} from '../../event';

export class PlayerController extends Controller implements ReactiveController {

	constructor(host: LecturePlayer) {
		const eventEmitter = new EventEmitter();
		const context: ApplicationContext = {
			eventEmitter: eventEmitter,
			eventService: new EventService(eventEmitter),
			chatService: new ChatService(0),
			moderationService: new ModerationService(),
			host: host,
		}

		super(new RootController(context), context);

		host.addController(this);
	}

	hostConnected() {
		this.eventService.connect();

		this.eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		this.eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		this.eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		this.eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		this.eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));
	}

	private onEventServiceState(event: LpEventServiceStateEvent) {
		const state = event.detail;

		console.log("~ on event service", state, uiStateStore.state);
	}

	private onChatState(event: LpChatStateEvent) {
		const chatState = event.detail;

		console.log("~ on chat state", chatState);

		const course = courseStore.findCourse(chatState.courseId);
		if (course) {
			course.messageFeature = chatState.started ? chatState.feature : null;
		}
	}

	private onQuizState(event: LpQuizStateEvent) {
		const quizState = event.detail;

		console.log("~ on quiz state", quizState);

		const course = courseStore.findCourse(quizState.courseId);
		if (course) {
			course.quizFeature = quizState.started ? quizState.feature : null;
		}
	}

	private onRecordingState(event: LpRecordingStateEvent) {
		const recordingState = event.detail;

		console.log("~ on recording state", recordingState);

		const course = courseStore.findCourse(recordingState.courseId);
		if (course) {
			course.isRecorded = recordingState.recorded;
		}
	}

	private onStreamState(event: LpStreamStateEvent) {
		const streamState = event.detail;

		console.log("~ on stream state", streamState);

		const course = courseStore.findCourse(streamState.courseId);
		if (course) {
			course.isLive = streamState.started;
		}
	}
}
