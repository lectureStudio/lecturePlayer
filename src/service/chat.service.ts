import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { featureStore } from '../store/feature.store';
import { chatStore } from '../store/chat.store';
import { EventEmitter } from '../utils/event-emitter';
import { Utils } from '../utils/utils';

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

	private eventEmitter: EventEmitter;


	initialize(courseId: number, client: Client, eventEmitter: EventEmitter): void {
		this.courseId = courseId;
		this.client = client;
		this.eventEmitter = eventEmitter;

		client.subscribe("/topic/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatStore.addMessage(chatMessage);
		});
		client.subscribe("/user/queue/course/" + this.courseId + "/chat", (message: Message) => {
			const chatMessage = JSON.parse(message.body);

			chatStore.addMessage(chatMessage);
		});
		client.subscribe("/user/queue/chat/response", (message: Message) => {
			this.handleEvent("lp-chat-response", message.body);
		});
		client.subscribe("/user/queue/chat/error", (message: Message) => {
			this.handleEvent("lp-chat-error", message.body);
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

		const message: ChatMessageDto = {
			serviceId: featureStore.chatFeature.featureId,
			text: text.toString()
		};

		return new Promise<void>(resolve => {
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

	private handleEvent(eventName: string, body: string) {
		this.eventEmitter.dispatchEvent(Utils.createEvent(eventName, JSON.parse(body)));
	}
}