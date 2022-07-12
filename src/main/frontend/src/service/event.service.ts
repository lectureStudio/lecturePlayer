import { Utils } from "../utils/utils";
import { Client, Message } from '@stomp/stompjs';

export class EventService extends EventTarget {

	constructor(courseId: number) {
		super();

		this.initialize(courseId);
	}

	private initialize(courseId: number) {
		const client = new Client({
			brokerURL: "wss://" + window.location.host + "/ws-state",
			reconnectDelay: 1000,
			heartbeatIncoming: 1000,
			heartbeatOutgoing: 1000,
			debug: function (msg) {
				// console.log("STOMP: " + str);
			},
		});
		client.onConnect = () => {
			client.subscribe("/topic/course-state/" + courseId + "/stream", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Stream state", state);

				this.dispatchEvent(Utils.createEvent("stream-state", state));
			});
			client.subscribe("/topic/course-state/" + courseId + "/recording", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Recording state", state);

				this.dispatchEvent(Utils.createEvent("recording-state", state));
			});
			client.subscribe("/topic/course-state/" + courseId + "/speech", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Speech state", state);

				this.dispatchEvent(Utils.createEvent("speech-state", state));
			});
			client.subscribe("/topic/course-state/" + courseId + "/messenger", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Messenger state", state);

				this.dispatchEvent(Utils.createEvent("messenger-state", state));
			});
			client.subscribe("/topic/course-state/" + courseId + "/quiz", (message: Message) => {
				const state = JSON.parse(message.body);

				console.log("Quiz state", state);

				this.dispatchEvent(Utils.createEvent("quiz-state", state));
			});
		};
		client.onStompError = function (frame) {
			// Will be invoked in case of error encountered at Broker.
			// Compliant brokers will terminate the connection after any error.
			console.error("Broker reported error: " + frame.headers["message"]);
			console.error("Additional details: " + frame.body);
		};
		client.activate();

		window.addEventListener("beforeunload", () => {
			client.deactivate();
		});
	}
}