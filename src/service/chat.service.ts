import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { featureStore } from '../store/feature.store';
import { chatStore } from '../store/chat.store';

export enum ChatRecipientType {

	Public = "public",
	Organisers = "organisers"

}

export interface ChatMessageDto {

	serviceId: string;

	text: string;

}

export interface ChatMessage {

	_type: string;

	messageId: string;

	time: string;

	text: string;

	firstName: string;

	familyName: string;

	userId: string;

	read: boolean;

}

export interface DirectChatMessage extends ChatMessage {

	recipientId: string;

	recipientFirstName: string;

	recipientFamilyName: string;

}

export interface ChatHistory {

	messages: ChatMessage[];

}

export class ChatService extends EventTarget implements EventSubService {

	private courseId: number;

	private client: Client;


	initialize(courseId: number, client: Client): void {
		this.courseId = courseId;
		this.client = client;

		client.subscribe("/topic/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatStore.addMessage(chatMessage);
		});
		client.subscribe("/user/queue/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatStore.addMessage(chatMessage);
		});
	}

	postMessage(data: FormData): Promise<void> {
		const recipient = data.get("recipient");
		const text = data.get("text");

		if (!recipient) {
			return Promise.reject("Recipient is not set");
		}
		if (!text) {
			return Promise.reject("Text is not set");
		}
		if (!this.client.connected) {
			return Promise.reject("Not connected");
		}
		if (!featureStore.chatFeature) {
			return Promise.reject("Feature must be active");
		}
		if (!featureStore.chatFeature) {
			return Promise.reject("Feature must be active");
		}

		const message: ChatMessageDto = {
			serviceId: featureStore.chatFeature.featureId,
			text: text.toString()
		};

		return new Promise<void>((resolve, reject) => {
			const headers: StompHeaders = {
				courseId: this.courseId.toString(),
				recipient: recipient.toString(),
			}

			this.client.publish({
				destination: `/app/message/${this.courseId}`,
				body: JSON.stringify(message),
				headers: headers,
			});

			resolve();
		});
	}
}