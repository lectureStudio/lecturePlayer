import { EventEmitter } from "../utils/event-emitter";
import { State } from "../utils/state";
import { Utils } from "../utils/utils";
import { Client } from '@stomp/stompjs';

export interface EventSubService {

	initialize(client: Client, eventEmitter: EventEmitter): void;

}

export class EventService extends EventTarget {

	private readonly eventEmitter: EventEmitter;

	private readonly subServices: EventSubService[];

	private client: Client | undefined;


	constructor(eventEmitter: EventEmitter) {
		super();

		this.eventEmitter = eventEmitter;
		this.subServices = [];
	}

	addEventSubService(service: EventSubService) {
		this.subServices.push(service);
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

			for (const subService of this.subServices) {
				subService.initialize(client, this.eventEmitter);
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
