import { EventEmitter } from "../utils/event-emitter";
import { Utils } from "../utils/utils";
import { Client, Message } from '@stomp/stompjs';

export interface EventSubService {

	initialize(courseId: number, client: Client): void;

}

export class EventService extends EventTarget {

	private readonly courseId: number;

	private readonly eventEmitter: EventEmitter;

	private readonly subServices: EventSubService[];


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
			debug: (message) => {
				// console.log("STOMP: " + message);
			},
		});
		client.onConnect = () => {
			this.eventEmitter.dispatchEvent(Utils.createEvent("event-service-state", {
				connected: true
			}));

			client.subscribe("/topic/course/event/" + this.courseId + "/stream", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Stream state", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("stream-state", state));
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/recording", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Recording state", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("recording-state", state));
			});
			client.subscribe("/user/queue/course/" + this.courseId + "/speech", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Speech state", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("speech-state", state));
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/chat", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Chat state", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("chat-state", state));
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/quiz", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Quiz state", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("quiz-state", state));
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/media", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Media", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("media-state", state));
			});
			client.subscribe("/topic/course/event/" + this.courseId + "/presence", (message: Message) => {
				const state = JSON.parse(message.body);

				// console.log("Presence", state);

				this.eventEmitter.dispatchEvent(Utils.createEvent("participant-presence", state));
			});

			for (const subService of this.subServices) {
				subService.initialize(this.courseId, client);
			}
		};
		client.onDisconnect = () => {
			console.log("STOMP disconnected");
		};
		client.activate();

		window.addEventListener("beforeunload", () => {
			client.deactivate();
		});

		return client;
	}
}