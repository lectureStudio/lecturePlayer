import { EventEmitter } from "../utils/event-emitter";
import { Utils } from "../utils/utils";
import { Client, Message } from '@stomp/stompjs';
import { EventSubService } from "./event.service";

export class CourseEventService extends EventTarget implements EventSubService {

	private readonly courseId: number;

	private eventEmitter: EventEmitter;


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
	}

	initialize(client: Client, eventEmitter: EventEmitter): void {
		this.eventEmitter = eventEmitter;

		this.subscribeTopic(client, "/stream", "lp-stream-state");
		this.subscribeTopic(client, "/recording", "lp-recording-state");
		this.subscribeTopic(client, "/chat", "lp-chat-state");
		this.subscribeTopic(client, "/quiz", "lp-quiz-state");
		this.subscribeTopic(client, "/media", "lp-media-state");
		this.subscribeTopic(client, "/presence", "lp-participant-presence");
		this.subscribeTopic(client, "/publisher", "lp-publisher-presence");
		this.subscribeTopic(client, "/moderation", "lp-participant-moderation");
		this.subscribeQueue(client, "/speech", "lp-speech-state");
	}

	private subscribeTopic(client: Client, eventName: string, eventType: string) {
		client.subscribe("/topic/course/event/" + this.courseId + eventName, (message: Message) => {
			this.handleEvent(eventType, message.body);
		});
	}

	private subscribeQueue(client: Client, eventName: string, eventType: string) {
		client.subscribe("/user/queue/course/" + this.courseId + eventName, (message: Message) => {
			this.handleEvent(eventType, message.body);
		});
	}

	private handleEvent(eventName: string, body: string) {
		this.eventEmitter.dispatchEvent(Utils.createEvent(eventName, JSON.parse(body)));
	}
}
