import { ChatMessage, MessageFeature } from "../model/course-feature";
import { Client, Message, StompHeaders } from '@stomp/stompjs';
import { Utils } from "../utils/utils";

export interface MessageServiceMessage {

	time: string;

	text: string;

	firstName: string;

	familyName: string;

	username: string;

}

export interface MessageServiceHistory {

	messages: MessageServiceMessage[];

}

export class MessageService extends EventTarget {

	private readonly courseId: number;

	private client: Client;

	userId: string;

	feature: MessageFeature;

	messages: MessageServiceMessage[];


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
		this.messages = [];

		this.fetchMessageHistory()
			.then((history: MessageServiceHistory) => {
				this.messages = history.messages;

				this.dispatchEvent(Utils.createEvent("message-service-message-history", this.messages));
			})
			.catch(error => {
				console.error(error);
			});

		this.initClient();
	}

	getMessageHistory(): MessageServiceMessage[] {
		return this.messages;
	}

	fetchMessageHistory(): Promise<MessageServiceHistory> {
		return new Promise<MessageServiceHistory>((resolve, reject) => {
			fetch("/course/messenger/history/" + this.courseId, {
				method: "GET",
			})
			.then(response => response.json())
			.then(jsonResponse => {
				resolve(jsonResponse as MessageServiceHistory);
			})
			.catch(error => {
				reject(error);
			});
		});
	}

	postMessage(form: HTMLFormElement): Promise<void> {
		const data = new FormData(form);
		const message: ChatMessage = {
			serviceId: data.get("serviceId").toString(),
			text: data.get("text").toString()
		};
		const target = data.get("target").toString();

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

	private initClient() {
		this.client = new Client({
			brokerURL: "wss://" + window.location.host + "/api/subscriber/messenger",
			reconnectDelay: 1000,
			heartbeatIncoming: 1000,
			heartbeatOutgoing: 1000,
			debug: (message) => {
				// console.log("STOMP MessageService: " + message);
			},
		});
		this.client.onConnect = this.onConnected.bind(this);
		this.client.onDisconnect = this.onDisconnected.bind(this);;
		this.client.activate();

		window.addEventListener("beforeunload", () => {
			this.client.deactivate();
		});
	}

	private async onConnected() {
		console.log("STOMP MessageService connected");

		this.client.subscribe("/topic/chat/" + this.courseId, (message: Message) => {
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

		this.client.subscribe("/user/queue/chat/" + this.courseId, (message: Message) => {
			// this.onMessengerDirectMessageReceive(JSON.parse(message.body));
			const chatMessage = JSON.parse(message.body);

			console.log(chatMessage);

			this.messages.push(chatMessage);

			this.dispatchEvent(Utils.createEvent("message-service-private-message", chatMessage));
		});
	}

	private onDisconnected() {
		console.log("STOM MessageService disconnected");
	}
}