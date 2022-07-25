import { Utils } from "../utils/utils";
import { Client, Message } from '@stomp/stompjs';

export interface EventSubService {

	initialize(courseId: number, client: Client): void;

}

export class EventService extends EventTarget {

	private readonly courseId: number;

	private client: Client;

	private subServices: EventSubService[];


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
		this.subServices = [];
	}

	addEventSubService(service: EventSubService) {
		this.subServices.push(service);
	}

	connect() {
		const client = new Client({
			brokerURL: "wss://" + window.location.host + "/ws-state",
			connectHeaders: {
				courseId: this.courseId.toString()
			},
			reconnectDelay: 1000,
			heartbeatIncoming: 1000,
			heartbeatOutgoing: 1000,
			debug: (message) => {
				// console.log("STOMP: " + message);
			},
		});
		client.onConnect = () => {
			console.log("STOMP connected");

			this.dispatchEvent(Utils.createEvent("event-service-state", {
				connected: true
			}));

			client.subscribe("/topic/course/" + this.courseId + "/stream", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Stream state", state);

				this.dispatchEvent(Utils.createEvent("stream-state", state));
			});
			client.subscribe("/topic/course/" + this.courseId + "/recording", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Recording state", state);

				this.dispatchEvent(Utils.createEvent("recording-state", state));
			});
			client.subscribe("/topic/course/" + this.courseId + "/speech", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Speech state", state);

				this.dispatchEvent(Utils.createEvent("speech-state", state));
			});
			client.subscribe("/topic/course/" + this.courseId + "/messenger", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Messenger state", state);

				this.dispatchEvent(Utils.createEvent("messenger-state", state));
			});
			client.subscribe("/topic/course/" + this.courseId + "/quiz", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Quiz state", state);

				this.dispatchEvent(Utils.createEvent("quiz-state", state));
			});
			client.subscribe("/topic/course/" + this.courseId + "/presence", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Presence", state);

				this.dispatchEvent(Utils.createEvent("participant-presence", state));
			});
			client.subscribe("/app/course/participants/" + this.courseId, (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Presence state", state);

				this.dispatchEvent(Utils.createEvent("presence-state", state));
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