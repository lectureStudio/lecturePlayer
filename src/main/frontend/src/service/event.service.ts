import { Utils } from "../utils/utils";

export class EventService extends EventTarget {

	constructor() {
		super();

		this.initialize();
	}

	private initialize() {
		const eventSource = new EventSource("/course/events");
		eventSource.addEventListener("error", (event) => {
			if (eventSource.readyState != EventSource.CLOSED) {
				console.error("EventSource error occured", event);
			}
		});
		eventSource.addEventListener("stream-state", (event) => {
			console.log("Stream state", event.data);

			const message = JSON.parse(event.data);

			this.dispatchEvent(Utils.createEvent("stream-state", message));
		});
		eventSource.addEventListener("recording-state", (event) => {
			console.log("Recording state", event.data);

			const message = JSON.parse(event.data);

			this.dispatchEvent(Utils.createEvent("recording-state", message));
		});
		eventSource.addEventListener("speech-state", (event) => {
			console.log("Speech state", event.data);

			const message = JSON.parse(event.data);

			this.dispatchEvent(Utils.createEvent("speech-state", message));
		});
		eventSource.addEventListener("messenger-state", (event) => {
			console.log("Messenger state", event.data);

			const message = JSON.parse(event.data);

			this.dispatchEvent(Utils.createEvent("messenger-state", message));
		});
		eventSource.addEventListener("quiz-state", (event) => {
			console.log("Quiz state", event.data);

			const message = JSON.parse(event.data);

			this.dispatchEvent(Utils.createEvent("quiz-state", message));
		});

		window.addEventListener("beforeunload", () => {
			eventSource.close();
		});
	}
}