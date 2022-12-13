import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { chatHistory } from '../model/chat-history';
import { course } from '../model/course';

export enum ChatRecipientType {

	Public = "public",
	Organisers = "organisers"

}

export interface ChatMessage {

	serviceId: string;

	text: string;

}

export interface MessageServiceMessage {

	_type: string;

	time: string;

	text: string;

	firstName: string;

	familyName: string;

	userId: string;

}

export interface MessageServiceDirectMessage extends MessageServiceMessage {

	recipientId: string;

	recipientFirstName: string;

	recipientFamilyName: string;

}

export interface MessageServiceHistory {

	messages: MessageServiceMessage[];

}

export class MessageService extends EventTarget implements EventSubService {

	private courseId: number;

	private client: Client;


	initialize(courseId: number, client: Client): void {
		this.courseId = courseId;
		this.client = client;

		client.subscribe("/topic/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatHistory.add(chatMessage);
		});
		client.subscribe("/user/queue/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatHistory.add(chatMessage);
		});
	}

	postMessage(form: HTMLFormElement): Promise<void> {
		const data = new FormData(form);
		const message: ChatMessage = {
			serviceId: course.chatFeature.featureId,
			text: data.get("text").toString()
		};
		const recipient = data.get("recipient");

		if (!recipient) {
			return Promise.reject("recipient");
		}

		return new Promise<void>((resolve, reject) => {
			if (!this.client.connected) {
				reject("connection");
				return;
			}

			const headers: StompHeaders = {
				courseId: this.courseId.toString(),
				recipient: recipient.toString(),
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