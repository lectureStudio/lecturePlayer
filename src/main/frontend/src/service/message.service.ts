import { ChatMessage, MessageFeature } from "../model/course-feature";
import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { Utils } from "../utils/utils";
import { EventSubService } from "./event.service";

export interface MessageServiceMessage {

	time: string;

	text: string;

	firstName: string;

	familyName: string;

	userId: string;

}

export interface MessageServiceHistory {

	messages: MessageServiceMessage[];

}

export class MessageService extends EventTarget implements EventSubService {

	private courseId: number;

	private client: Client;

	userId: string;

	feature: MessageFeature;

	messages: MessageServiceMessage[];


	constructor() {
		super();

		this.messages = [];
	}

	initialize(courseId: number, client: Client): void {
		this.courseId = courseId;
		this.client = client;

		client.subscribe("/topic/chat/" + this.courseId, (message: Message) => {
			const chatMessage = JSON.parse(message.body);
			const type = chatMessage["_type"];

			console.log(chatMessage);

			this.messages.push(chatMessage);

			switch (type) {
				case "MessengerMessage":
					this.dispatchEvent(Utils.createEvent("message-service-public-message", chatMessage));
					break;

				case "MessengerReplyMessage":
					// this.onMessengerReplyMessageReceive(chatMessage, message.headers);
					break;
			}
		});

		client.subscribe("/user/queue/chat/" + this.courseId, (message: Message) => {
			// this.onMessengerDirectMessageReceive(JSON.parse(message.body));
			const chatMessage = JSON.parse(message.body);

			console.log(chatMessage);

			this.messages.push(chatMessage);

			this.dispatchEvent(Utils.createEvent("message-service-private-message", chatMessage));
		});

		client.subscribe("/app/course/chat/history/" + this.courseId, (message: Message) => {
			const history = JSON.parse(message.body);

			this.messages = history.messages;

			this.dispatchEvent(Utils.createEvent("message-service-message-history", this.messages));
		});
	}

	getMessageHistory(): MessageServiceMessage[] {
		return this.messages;
	}

	postMessage(form: HTMLFormElement): Promise<void> {
		const data = new FormData(form);
		const message: ChatMessage = {
			serviceId: this.feature.featureId,
			text: data.get("text").toString()
		};
		const target = data.get("target").toString();

		console.log(target);

		return new Promise<void>((resolve, reject) => {
			if (!this.client.connected) {
				reject();
				return;
			}

			const headers: StompHeaders = {
				courseId: this.courseId.toString(),
				messageType: target,
			}

			if (target === "user") {
				// headers.username = this.messengerDestination.username;
			}

			this.client.publish({
				destination: "/app/message/" + this.courseId,
				body: JSON.stringify(message),
				headers: headers,
			});

			resolve();
		});
	}
}