import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { EventSubService } from "./event.service";
import { featureStore } from '../store/feature.store';
import { chatStore } from '../store/chat.store';
import { userStore } from "../store/user.store";
import { t } from "../component/i18n-mixin";
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

export interface ChatMessageAsReplyDto extends ChatMessageDto {
	msgIdToReplyTo: string;
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

	deleted: boolean;

	edited: boolean
}

 export interface ChatMessageAsReply extends ChatMessage {
	msgIdToReplyTo: string;
 }

export interface DirectChatMessage extends ChatMessage {

	recipientId: string;

	recipientFirstName: string;

	recipientFamilyName: string;

}

export interface DirectChatMessageAsReply extends DirectChatMessage {
	msgIdToReplyTo: string;
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
		client.subscribe("/topic/course/" + this.courseId + "/chat/deletion", (message: Message) => {
			const messageToDelete = JSON.parse(message.body);

			chatStore.updateMessage(messageToDelete);
		});
		client.subscribe("/topic/course/" + this.courseId + "/chat/edit", (message: Message) => {
            const messageToEdit = JSON.parse(message.body);

            chatStore.updateMessage(messageToEdit);
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

	postMessage(data: FormData, msgToReplyTo: string | undefined): Promise<void> {
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

		const message: ChatMessageDto | ChatMessageAsReplyDto = this.buildChatMessageDto(
			featureStore.chatFeature.featureId,
			text.toString(),
			msgToReplyTo);

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

	deleteMessage(messageId: string): Promise<void> {
		if(!messageId) {
			return Promise.reject("messageId to delete is not given.");
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
			text: messageId
		}

		return new Promise<void>(resolve => {
			this.client.publish({
				destination: `/app/message/chat/${this.courseId}/deletion`,
				body: JSON.stringify(message),
			});

			resolve();
		});
	}

	editMessage(text: string, messageId: string): Promise<void> {
		if (!text) {
			return Promise.reject("Text is not set");
		}
		if(!messageId) {
			return Promise.reject("messageId to edit is not given.");
		}
		if (!this.client.connected) {
			return Promise.reject("Not connected");
		}
		if (!featureStore.chatFeature) {
			return Promise.reject("Feature must be active");
		}

		const editedMessage: ChatMessageDto = {
			serviceId: featureStore.chatFeature.featureId,
			text: text,
		};

		return new Promise<void>((resolve) => {
			const headers: StompHeaders = {
				courseId: this.courseId.toString(),
				messageId: messageId,
			};

			this.client.publish({
				destination: `/app/message/chat/${this.courseId}/edit`,
				body: JSON.stringify(editedMessage),
				headers: headers,
			}); 

			resolve();
		});
	}

	static isReply(message: ChatMessage | ChatMessageAsReply | DirectChatMessageAsReply): boolean {
		return 'msgIdToReplyTo' in message;
	}

	static isDirectMessage(message: ChatMessage): boolean {
		return message._type === "MessengerDirectMessage" || message._type === "MessengerDirectMessageAsReply";
	}

	static isPrivateMessage(message: ChatMessage): boolean {
		return this.isDirectMessage(message) && (message as DirectChatMessage).recipientId !== "organisators";
	}

	static isMessageToOrganisers(message: ChatMessage): boolean {
		return this.isDirectMessage(message) && (message as DirectChatMessage).recipientId === "organisers";
	}

	static getMessageSender(message: ChatMessage, direct: boolean) {
		const byMe = message.userId === userStore.userId;
		const sender = byMe ? `${t("course.feature.message.me")}` : `${message.firstName} ${message.familyName}`;
		const recipient = direct ? ChatService.getMessageRecipient(message as DirectChatMessage) : null;

		if (direct) {
			return t("course.feature.message.recipient", {
				sender: sender,
				recipient: recipient
			});
		}

		return sender;
	}

	static getMessageRecipient(message: DirectChatMessage) {
		const toMe = message.recipientId === userStore.userId;
		const toOrganisers = message.recipientId === "organisers";

		return toMe
			? `${t("course.feature.message.to.me")}`
			: toOrganisers
				? `${t("course.feature.message.to.organisers")}`
				: `${message.recipientFirstName} ${message.recipientFamilyName}`;
	}

	private buildChatMessageDto(serviceId: string, text: string, msgIdToReplyTo: string | undefined): ChatMessageDto | ChatMessageAsReplyDto {
		return msgIdToReplyTo
			? {serviceId: serviceId, text: text, msgIdToReplyTo: msgIdToReplyTo}
			: {serviceId: serviceId, text: text};
	}

	private handleEvent(eventName: string, body: string) {
		this.eventEmitter.dispatchEvent(Utils.createEvent(eventName, JSON.parse(body)));
	}
}
