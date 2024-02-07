import { EventEmitter } from "../utils/event-emitter";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { Client, Message } from '@stomp/stompjs';

export interface EventSubService {

	initialize(courseId: number, client: Client, eventEmitter: EventEmitter): void;

}

export class EventService extends EventTarget {

	private readonly courseId: number;

	private readonly eventEmitter: EventEmitter;

	private readonly subServices: EventSubService[];

	private client: Client | undefined;


	constructor(courseId: number, eventEmitter: EventEmitter) {
		super();

		this.courseId = courseId;
		this.eventEmitter = eventEmitter;
		this.subServices = [];
	}

	addEventSubService(service: EventSubService) {
		this.subServices.push(service);
	}

	connect() {
		const client = new Client({
			brokerURL: "wss://" + window.location.host + "/ws-state",
			connectHeaders: {
				"course-id": this.courseId.toString()
			},
			reconnectDelay: 1000,
			heartbeatIncoming: 1000,
			heartbeatOutgoing: 1000,
			discardWebsocketOnCommFailure: false,
			debug: (_message) => {
				// console.log("STOMP: " + _message);
			},
		});
		client.onConnect = () => {
			this.eventEmitter.dispatchEvent(Utils.createEvent("lp-event-service-state", State.CONNECTED));

			client.subscribe("/topic/course/event/" + this.courseId + "/stream", (message: Message) => {
				this.handleEvent("lp-stream-state", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/recording", (message: Message) => {
				this.handleEvent("lp-recording-state", message.body);
			});
			client.subscribe("/user/queue/course/" + this.courseId + "/speech", (message: Message) => {
				this.handleEvent("lp-speech-state", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/chat", (message: Message) => {
				this.handleEvent("lp-chat-state", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/quiz", (message: Message) => {
				this.handleEvent("lp-quiz-state", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/media", (message: Message) => {
				this.handleEvent("lp-media-state", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/presence", (message: Message) => {
				this.handleEvent("lp-participant-presence", message.body);
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/publisher", (message: Message) => {
				this.handleEvent("lp-publisher-presence", message.body);
			});

			for (const subService of this.subServices) {
				subService.initialize(this.courseId, client, this.eventEmitter);
			}
		};
		client.onDisconnect = () => {
			console.log("STOMP disconnected");
		};
		client.activate();

		window.addEventListener("beforeunload", () => {
			client.deactivate();
		});

		this.client = client;

		return client;
	}

	close() {
		console.log("** EventService closes, disconnecting STOMP");
		this.client?.deactivate()
	}

	private handleEvent(eventName: string, body: string) {
		this.eventEmitter.dispatchEvent(Utils.createEvent(eventName, JSON.parse(body)));
	}
}
