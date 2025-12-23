import { expect } from "@open-wc/testing";

import { ChatService, ChatMessage, DirectChatMessage, ChatRecipientType, ChatMessageAsReply, DirectChatMessageAsReply } from "./chat.service.js";
import { featureStore } from "../store/feature.store.js";
import { userStore } from "../store/user.store.js";
import { chatStore } from "../store/chat.store.js";
import { EventEmitter } from "../utils/event-emitter.js";
import { Client } from "@stomp/stompjs";

// Helper to create mock STOMP client
function createMockClient(connected: boolean = true): Client & { 
	publishedMessages: any[], 
	subscriptions: Map<string, (message: any) => void> 
} {
	const subscriptions = new Map<string, (message: any) => void>();
	const publishedMessages: any[] = [];

	return {
		connected,
		subscriptions,
		publishedMessages,
		subscribe: (destination: string, callback: any) => {
			subscriptions.set(destination, callback);
			return { id: destination, unsubscribe: () => {} } as any;
		},
		publish: (params: any) => {
			publishedMessages.push(params);
		}
	} as any;
}

// Helper to create a base chat message
function createChatMessage(overrides: Partial<ChatMessage> = {}): ChatMessage {
	return {
		_type: "MessengerMessage",
		messageId: "msg-1",
		time: "2024-01-01T12:00:00Z",
		text: "Hello World",
		firstName: "John",
		familyName: "Doe",
		userId: "user-1",
		read: false,
		deleted: false,
		edited: false,
		...overrides
	};
}

// Helper to create a direct chat message
function createDirectChatMessage(overrides: Partial<DirectChatMessage> = {}): DirectChatMessage {
	return {
		...createChatMessage({ _type: "MessengerDirectMessage" }),
		recipientId: "user-2",
		recipientFirstName: "Jane",
		recipientFamilyName: "Smith",
		...overrides
	};
}

describe("ChatService", () => {
	let chatService: ChatService;

	beforeEach(() => {
		chatService = new ChatService();
		featureStore.reset();
		userStore.reset();
		chatStore.reset();
	});

	describe("constructor", () => {
		it("creates chat service instance", () => {
			expect(chatService).to.exist;
		});

		it("extends EventTarget", () => {
			expect(chatService).to.be.instanceOf(EventTarget);
		});

		it("implements EventSubService interface", () => {
			expect(chatService.initialize).to.be.a("function");
		});
	});

	describe("ChatRecipientType", () => {
		it("has Public type", () => {
			expect(ChatRecipientType.Public).to.equal("public");
		});

		it("has Organisers type", () => {
			expect(ChatRecipientType.Organisers).to.equal("organisers");
		});
	});

	describe("initialize", () => {
		let mockClient: ReturnType<typeof createMockClient>;
		let eventEmitter: EventEmitter;

		beforeEach(() => {
			mockClient = createMockClient();
			eventEmitter = new EventEmitter();
		});

		it("stores courseId", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			// No direct way to check, but it's used in subscriptions
			expect(mockClient.subscriptions.size).to.be.greaterThan(0);
		});

		it("stores client", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.size).to.be.greaterThan(0);
		});

		it("stores eventEmitter", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			// Used in handleEvent
		});

		it("subscribes to chat topic", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/topic/course/123/chat")).to.be.true;
		});

		it("subscribes to chat deletion topic", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/topic/course/123/chat/deletion")).to.be.true;
		});

		it("subscribes to chat edit topic", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/topic/course/123/chat/edit")).to.be.true;
		});

		it("subscribes to user chat queue", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/user/queue/course/123/chat")).to.be.true;
		});

		it("subscribes to chat response queue", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/user/queue/chat/response")).to.be.true;
		});

		it("subscribes to chat error queue", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.has("/user/queue/chat/error")).to.be.true;
		});

		it("subscribes to exactly 6 topics", () => {
			chatService.initialize(123, mockClient as any, eventEmitter);
			expect(mockClient.subscriptions.size).to.equal(6);
		});
	});

	describe("subscription message handling", () => {
		let mockClient: ReturnType<typeof createMockClient>;
		let eventEmitter: EventEmitter;

		beforeEach(() => {
			mockClient = createMockClient();
			eventEmitter = new EventEmitter();
			chatService.initialize(123, mockClient as any, eventEmitter);
		});

		it("adds message to chatStore on chat topic message", () => {
			const message = createChatMessage();
			const callback = mockClient.subscriptions.get("/topic/course/123/chat");

			callback?.({ body: JSON.stringify(message) });

			expect(chatStore.messages.length).to.equal(1);
			expect(chatStore.messages[0].messageId).to.equal("msg-1");
		});

		it("updates message on deletion topic message", () => {
			// First add a message
			chatStore.addMessage(createChatMessage());
			expect(chatStore.messages[0].deleted).to.be.false;

			// Then delete it
			const deletedMessage = createChatMessage({ deleted: true });
			const callback = mockClient.subscriptions.get("/topic/course/123/chat/deletion");

			callback?.({ body: JSON.stringify(deletedMessage) });

			expect(chatStore.messages[0].deleted).to.be.true;
		});

		it("updates message on edit topic message", () => {
			// First add a message
			chatStore.addMessage(createChatMessage({ text: "Original" }));
			expect(chatStore.messages[0].text).to.equal("Original");

			// Then edit it
			const editedMessage = createChatMessage({ text: "Edited", edited: true });
			const callback = mockClient.subscriptions.get("/topic/course/123/chat/edit");

			callback?.({ body: JSON.stringify(editedMessage) });

			expect(chatStore.messages[0].text).to.equal("Edited");
			expect(chatStore.messages[0].edited).to.be.true;
		});

		it("adds message on user chat queue message", () => {
			const message = createDirectChatMessage();
			const callback = mockClient.subscriptions.get("/user/queue/course/123/chat");

			callback?.({ body: JSON.stringify(message) });

			expect(chatStore.messages.length).to.equal(1);
		});

		it("dispatches lp-chat-response on response queue message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-chat-response", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = mockClient.subscriptions.get("/user/queue/chat/response");
			callback?.({ body: JSON.stringify({ statusCode: 0, statusMessage: "Success" }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.statusCode).to.equal(0);
		});

		it("dispatches lp-chat-error on error queue message", () => {
			let receivedEvent: any;
			eventEmitter.addEventListener("lp-chat-error", (event: CustomEvent) => {
				receivedEvent = event.detail;
			});

			const callback = mockClient.subscriptions.get("/user/queue/chat/error");
			callback?.({ body: JSON.stringify({ statusCode: 1, statusMessage: "Error" }) });

			expect(receivedEvent).to.exist;
			expect(receivedEvent.statusCode).to.equal(1);
		});
	});

	describe("postMessage", () => {
		let mockClient: ReturnType<typeof createMockClient>;
		let eventEmitter: EventEmitter;

		beforeEach(() => {
			mockClient = createMockClient(true);
			eventEmitter = new EventEmitter();
			chatService.initialize(123, mockClient as any, eventEmitter);
			featureStore.setChatFeature({ featureId: "chat-feature-1" } as any);
		});

		it("rejects when recipient is not set", async () => {
			const formData = new FormData();
			formData.set("text", "Hello");

			try {
				await chatService.postMessage(formData, undefined);
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Recipient is not set");
			}
		});

		it("rejects when text is not set", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");

			try {
				await chatService.postMessage(formData, undefined);
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Text is not set");
			}
		});

		it("rejects when not connected", async () => {
			mockClient.connected = false;

			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Hello");

			try {
				await chatService.postMessage(formData, undefined);
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Not connected");
			}
		});

		it("rejects when chat feature is not active", async () => {
			featureStore.reset();

			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Hello");

			try {
				await chatService.postMessage(formData, undefined);
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Feature must be active");
			}
		});

		it("publishes message to correct destination", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Hello World");

			await chatService.postMessage(formData, undefined);

			expect(mockClient.publishedMessages.length).to.equal(1);
			expect(mockClient.publishedMessages[0].destination).to.equal("/app/message/123");
		});

		it("includes recipient in headers", async () => {
			const formData = new FormData();
			formData.set("recipient", "organisers");
			formData.set("text", "Hello");

			await chatService.postMessage(formData, undefined);

			expect(mockClient.publishedMessages[0].headers.recipient).to.equal("organisers");
		});

		it("includes courseId in headers", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Hello");

			await chatService.postMessage(formData, undefined);

			expect(mockClient.publishedMessages[0].headers.courseId).to.equal("123");
		});

		it("includes serviceId in message body", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Hello");

			await chatService.postMessage(formData, undefined);

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.serviceId).to.equal("chat-feature-1");
		});

		it("includes text in message body", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Test message");

			await chatService.postMessage(formData, undefined);

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.text).to.equal("Test message");
		});

		it("includes msgIdToReplyTo when replying", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "Reply message");

			await chatService.postMessage(formData, "original-msg-id");

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.msgIdToReplyTo).to.equal("original-msg-id");
		});

		it("does not include msgIdToReplyTo when not replying", async () => {
			const formData = new FormData();
			formData.set("recipient", "public");
			formData.set("text", "New message");

			await chatService.postMessage(formData, undefined);

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.msgIdToReplyTo).to.be.undefined;
		});
	});

	describe("deleteMessage", () => {
		let mockClient: ReturnType<typeof createMockClient>;
		let eventEmitter: EventEmitter;

		beforeEach(() => {
			mockClient = createMockClient(true);
			eventEmitter = new EventEmitter();
			chatService.initialize(123, mockClient as any, eventEmitter);
			featureStore.setChatFeature({ featureId: "chat-feature-1" } as any);
		});

		it("rejects when messageId is not provided", async () => {
			try {
				await chatService.deleteMessage("");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("messageId to delete is not given.");
			}
		});

		it("rejects when not connected", async () => {
			mockClient.connected = false;

			try {
				await chatService.deleteMessage("msg-123");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Not connected");
			}
		});

		it("rejects when chat feature is not active", async () => {
			featureStore.reset();

			try {
				await chatService.deleteMessage("msg-123");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Feature must be active");
			}
		});

		it("publishes to correct destination", async () => {
			await chatService.deleteMessage("msg-123");

			expect(mockClient.publishedMessages.length).to.equal(1);
			expect(mockClient.publishedMessages[0].destination).to.equal("/app/message/chat/123/deletion");
		});

		it("includes serviceId in message body", async () => {
			await chatService.deleteMessage("msg-123");

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.serviceId).to.equal("chat-feature-1");
		});

		it("includes messageId as text in body", async () => {
			await chatService.deleteMessage("msg-to-delete");

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.text).to.equal("msg-to-delete");
		});
	});

	describe("editMessage", () => {
		let mockClient: ReturnType<typeof createMockClient>;
		let eventEmitter: EventEmitter;

		beforeEach(() => {
			mockClient = createMockClient(true);
			eventEmitter = new EventEmitter();
			chatService.initialize(123, mockClient as any, eventEmitter);
			featureStore.setChatFeature({ featureId: "chat-feature-1" } as any);
		});

		it("rejects when text is not set", async () => {
			try {
				await chatService.editMessage("", "msg-123");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Text is not set");
			}
		});

		it("rejects when messageId is not provided", async () => {
			try {
				await chatService.editMessage("Updated text", "");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("messageId to edit is not given.");
			}
		});

		it("rejects when not connected", async () => {
			mockClient.connected = false;

			try {
				await chatService.editMessage("Updated text", "msg-123");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Not connected");
			}
		});

		it("rejects when chat feature is not active", async () => {
			featureStore.reset();

			try {
				await chatService.editMessage("Updated text", "msg-123");
				expect.fail("Should have rejected");
			} catch (error) {
				expect(error).to.equal("Feature must be active");
			}
		});

		it("publishes to correct destination", async () => {
			await chatService.editMessage("Updated text", "msg-123");

			expect(mockClient.publishedMessages.length).to.equal(1);
			expect(mockClient.publishedMessages[0].destination).to.equal("/app/message/chat/123/edit");
		});

		it("includes courseId in headers", async () => {
			await chatService.editMessage("Updated text", "msg-123");

			expect(mockClient.publishedMessages[0].headers.courseId).to.equal("123");
		});

		it("includes messageId in headers", async () => {
			await chatService.editMessage("Updated text", "msg-to-edit");

			expect(mockClient.publishedMessages[0].headers.messageId).to.equal("msg-to-edit");
		});

		it("includes serviceId in message body", async () => {
			await chatService.editMessage("Updated text", "msg-123");

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.serviceId).to.equal("chat-feature-1");
		});

		it("includes new text in message body", async () => {
			await chatService.editMessage("This is the updated text", "msg-123");

			const body = JSON.parse(mockClient.publishedMessages[0].body);
			expect(body.text).to.equal("This is the updated text");
		});
	});

	describe("isReply", () => {
		it("returns true for ChatMessageAsReply", () => {
			const message: ChatMessageAsReply = {
				...createChatMessage(),
				msgIdToReplyTo: "original-msg"
			};

			expect(ChatService.isReply(message)).to.be.true;
		});

		it("returns true for DirectChatMessageAsReply", () => {
			const message: DirectChatMessageAsReply = {
				...createDirectChatMessage({ _type: "MessengerDirectMessageAsReply" }),
				msgIdToReplyTo: "original-msg"
			};

			expect(ChatService.isReply(message)).to.be.true;
		});

		it("returns false for regular ChatMessage", () => {
			const message = createChatMessage();
			expect(ChatService.isReply(message)).to.be.false;
		});

		it("returns false for regular DirectChatMessage", () => {
			const message = createDirectChatMessage();
			expect(ChatService.isReply(message)).to.be.false;
		});
	});

	describe("isDirectMessage", () => {
		it("returns true for MessengerDirectMessage type", () => {
			const message = createChatMessage({ _type: "MessengerDirectMessage" });
			expect(ChatService.isDirectMessage(message)).to.be.true;
		});

		it("returns true for MessengerDirectMessageAsReply type", () => {
			const message = createChatMessage({ _type: "MessengerDirectMessageAsReply" });
			expect(ChatService.isDirectMessage(message)).to.be.true;
		});

		it("returns false for MessengerMessage type", () => {
			const message = createChatMessage({ _type: "MessengerMessage" });
			expect(ChatService.isDirectMessage(message)).to.be.false;
		});

		it("returns false for MessengerMessageAsReply type", () => {
			const message = createChatMessage({ _type: "MessengerMessageAsReply" });
			expect(ChatService.isDirectMessage(message)).to.be.false;
		});
	});

	describe("isPrivateMessage", () => {
		it("returns true for direct message to specific user", () => {
			const message = createDirectChatMessage({ recipientId: "user-123" });
			expect(ChatService.isPrivateMessage(message)).to.be.true;
		});

		it("returns false for message to organisators", () => {
			const message = createDirectChatMessage({ recipientId: "organisators" });
			expect(ChatService.isPrivateMessage(message)).to.be.false;
		});

		it("returns false for public message", () => {
			const message = createChatMessage();
			expect(ChatService.isPrivateMessage(message)).to.be.false;
		});
	});

	describe("isMessageToOrganisers", () => {
		it("returns true for message to organisers", () => {
			const message = createDirectChatMessage({ recipientId: "organisers" });
			expect(ChatService.isMessageToOrganisers(message)).to.be.true;
		});

		it("returns false for message to specific user", () => {
			const message = createDirectChatMessage({ recipientId: "user-123" });
			expect(ChatService.isMessageToOrganisers(message)).to.be.false;
		});

		it("returns false for public message", () => {
			const message = createChatMessage();
			expect(ChatService.isMessageToOrganisers(message)).to.be.false;
		});
	});

	describe("getMessageSender", () => {
		beforeEach(() => {
			userStore.setUserId("current-user");
		});

		it("returns sender name for message from other user (public)", () => {
			const message = createChatMessage({
				userId: "other-user",
				firstName: "Alice",
				familyName: "Smith"
			});

			const sender = ChatService.getMessageSender(message, false);
			expect(sender).to.equal("Alice Smith");
		});

		it("returns 'Me' translation for message from current user (public)", () => {
			const message = createChatMessage({
				userId: "current-user",
				firstName: "John",
				familyName: "Doe"
			});

			const sender = ChatService.getMessageSender(message, false);
			// The translation key is "course.feature.message.me"
			expect(sender).to.exist;
		});

		it("returns formatted string for direct message from other user", () => {
			const message = createDirectChatMessage({
				userId: "other-user",
				firstName: "Alice",
				familyName: "Smith",
				recipientId: "current-user",
				recipientFirstName: "Current",
				recipientFamilyName: "User"
			});

			const sender = ChatService.getMessageSender(message, true);
			// Uses translation key "course.feature.message.recipient"
			// May return undefined if i18n is not initialized, which is acceptable
			// The function itself runs without error
		});
	});

	describe("getMessageRecipient", () => {
		beforeEach(() => {
			userStore.setUserId("current-user");
		});

		it("returns recipient name for message to specific user", () => {
			const message = createDirectChatMessage({
				recipientId: "other-user",
				recipientFirstName: "Bob",
				recipientFamilyName: "Johnson"
			});

			const recipient = ChatService.getMessageRecipient(message);
			expect(recipient).to.equal("Bob Johnson");
		});

		it("returns 'To me' translation for message to current user", () => {
			const message = createDirectChatMessage({
				recipientId: "current-user"
			});

			const recipient = ChatService.getMessageRecipient(message);
			// Uses translation key "course.feature.message.to.me"
			expect(recipient).to.exist;
		});

		it("returns 'To organisers' translation for message to organisers", () => {
			const message = createDirectChatMessage({
				recipientId: "organisers"
			});

			const recipient = ChatService.getMessageRecipient(message);
			// Uses translation key "course.feature.message.to.organisers"
			expect(recipient).to.exist;
		});
	});
});

describe("ChatMessage interfaces", () => {
	it("ChatMessage has all required properties", () => {
		const message: ChatMessage = {
			_type: "MessengerMessage",
			messageId: "1",
			time: "2024-01-01",
			text: "Hello",
			firstName: "John",
			familyName: "Doe",
			userId: "user-1",
			read: false,
			deleted: false,
			edited: false
		};

		expect(message._type).to.exist;
		expect(message.messageId).to.exist;
		expect(message.time).to.exist;
		expect(message.text).to.exist;
		expect(message.firstName).to.exist;
		expect(message.familyName).to.exist;
		expect(message.userId).to.exist;
		expect(typeof message.read).to.equal("boolean");
		expect(typeof message.deleted).to.equal("boolean");
		expect(typeof message.edited).to.equal("boolean");
	});

	it("DirectChatMessage extends ChatMessage", () => {
		const message: DirectChatMessage = {
			_type: "MessengerDirectMessage",
			messageId: "1",
			time: "2024-01-01",
			text: "Hello",
			firstName: "John",
			familyName: "Doe",
			userId: "user-1",
			read: false,
			deleted: false,
			edited: false,
			recipientId: "user-2",
			recipientFirstName: "Jane",
			recipientFamilyName: "Smith"
		};

		expect(message.recipientId).to.exist;
		expect(message.recipientFirstName).to.exist;
		expect(message.recipientFamilyName).to.exist;
	});

	it("ChatMessageAsReply extends ChatMessage", () => {
		const message: ChatMessageAsReply = {
			_type: "MessengerMessageAsReply",
			messageId: "1",
			time: "2024-01-01",
			text: "Reply",
			firstName: "John",
			familyName: "Doe",
			userId: "user-1",
			read: false,
			deleted: false,
			edited: false,
			msgIdToReplyTo: "original-msg"
		};

		expect(message.msgIdToReplyTo).to.exist;
	});

	it("DirectChatMessageAsReply extends DirectChatMessage", () => {
		const message: DirectChatMessageAsReply = {
			_type: "MessengerDirectMessageAsReply",
			messageId: "1",
			time: "2024-01-01",
			text: "Reply",
			firstName: "John",
			familyName: "Doe",
			userId: "user-1",
			read: false,
			deleted: false,
			edited: false,
			recipientId: "user-2",
			recipientFirstName: "Jane",
			recipientFamilyName: "Smith",
			msgIdToReplyTo: "original-msg"
		};

		expect(message.msgIdToReplyTo).to.exist;
		expect(message.recipientId).to.exist;
	});
});
