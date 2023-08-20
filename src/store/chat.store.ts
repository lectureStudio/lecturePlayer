import { ChatMessage } from "../service/chat.service";
import { makeAutoObservable } from "mobx";

class ChatStore {

	messages: ChatMessage[] = [];


	constructor() {
		makeAutoObservable(this);
	}

	addMessage(message: ChatMessage) {
		this.messages = [...this.messages, message];
	}

	removeMessage(message: ChatMessage) {
		this.messages = this.messages.filter((m) => m.messageId !== message.messageId);
	}

	updateMessage(updated: ChatMessage) {
		this.messages = this.messages.map((m) => m.messageId !== updated.messageId ? m : updated);
	}

	setMessages(messages: ChatMessage[]) {
		this.messages = messages;
	}

	reset() {
		this.messages = [];
	}

	get unreadMessages() {
		return this.messages.reduce((unread, message) => message.read ? unread : ++unread, 0);
	}
}

export const chatStore = new ChatStore();