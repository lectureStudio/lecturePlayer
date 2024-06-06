import { ReactiveController } from 'lit';
import { EventService } from '../../service/event.service';
import { ChatService } from '../../service/chat.service';
import { ModerationService } from "../../service/moderation.service";
import { LecturePlayer } from './player';
import { ApplicationContext } from '../controller/context';
import { EventEmitter } from '../../utils/event-emitter';
import { RootController } from '../controller/root.controller';
import { Controller } from '../controller/controller';
import { LpChatStateEvent, LpQuizStateEvent, LpRecordingStateEvent } from '../../event';

export class PlayerController extends Controller implements ReactiveController {

	private readonly host: LecturePlayer;

	private eventService: EventService;


	constructor(host: LecturePlayer) {
		const context: ApplicationContext = {
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			moderationService: new ModerationService(),
			host: host,
		}

		super(new RootController(context), context);

		this.host = host;
		this.host.addController(this);
	}

	hostConnected() {
		this.eventService = new EventService(this.eventEmitter);

		this.eventEmitter.addEventListener("lp-event-service-state", this.onEventServiceState.bind(this));
		this.eventEmitter.addEventListener("lp-chat-state", this.onChatState.bind(this));
		this.eventEmitter.addEventListener("lp-quiz-state", this.onQuizState.bind(this));
		this.eventEmitter.addEventListener("lp-recording-state", this.onRecordingState.bind(this));
		this.eventEmitter.addEventListener("lp-stream-state", this.onStreamState.bind(this));
	}

	private onChatState(event: LpChatStateEvent) {
		const chatState = event.detail;


	}

	private onQuizState(event: LpQuizStateEvent) {
		const quizState = event.detail;


	}

	private onRecordingState(event: LpRecordingStateEvent) {
		const recordingState = event.detail;


	}
}
