import { EventEmitter } from "../utils/event-emitter";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { Client } from '@stomp/stompjs';

export interface EventSubService {

	initialize(client: Client, eventEmitter: EventEmitter): void;

	dispose(): void;

}

export class EventService extends EventTarget {

	private readonly eventEmitter: EventEmitter;

	private client: Client | undefined;


	constructor(eventEmitter: EventEmitter) {
		super();

		this.eventEmitter = eventEmitter;
	}

	connect() {
		const client = new Client({
			brokerURL: "wss://" + window.location.host + "/ws-state",
			// connectHeaders: {
			// 	"course-id": this.courseId.toString()
			// },
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

			client.subscribe("/topic/course/event/all/stream", (message) => {
				this.handleEvent("lp-stream-state", message.body);
			});
			client.subscribe("/topic/course/event/all/recording", (message) => {
				this.handleEvent("lp-recording-state", message.body);
			});
			client.subscribe("/topic/course/event/all/chat", (message) => {
				this.handleEvent("lp-chat-state", message.body);
			});
			client.subscribe("/topic/course/event/all/quiz", (message) => {
				this.handleEvent("lp-quiz-state", message.body);
			});
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

	initializeSubService(service: EventSubService) {
		if (!this.client) {
			throw new Error("EventService must be initialized and connected");
		}

		service.initialize(this.client, this.eventEmitter);
	}

	disposeSubService(service: EventSubService) {
		if (!this.client) {
			throw new Error("EventService must be initialized and connected");
		}

		service.dispose();
	}

	private handleEvent(eventName: string, body: string) {
		this.eventEmitter.dispatchEvent(Utils.createEvent(eventName, JSON.parse(body)));
	}
}
