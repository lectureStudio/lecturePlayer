import { expect } from "@open-wc/testing";
import { chatStore } from "./chat.store.js";

interface ChatMessage {
	messageId: string;
	text: string;
	read?: boolean;
	deleted?: boolean;
}

function createMessage(id: string, text: string = "Hello", read: boolean = false, deleted: boolean = false): ChatMessage {
	return { messageId: id, text, read, deleted } as any;
}

describe("ChatStore", () => {
	beforeEach(() => {
		chatStore.reset();
	});

	afterEach(() => {
		chatStore.reset();
	});

	describe("addMessage", () => {
		it("adds a message", () => {
			chatStore.addMessage(createMessage("1"));
			expect(chatStore.messages).to.have.length(1);
		});

		it("adds multiple messages", () => {
			chatStore.addMessage(createMessage("1"));
			chatStore.addMessage(createMessage("2"));
			expect(chatStore.messages).to.have.length(2);
		});
	});

	describe("removeMessage", () => {
		it("removes a message by ID", () => {
			chatStore.addMessage(createMessage("1"));
			chatStore.addMessage(createMessage("2"));

			chatStore.removeMessage(createMessage("1"));

			expect(chatStore.messages).to.have.length(1);
			expect(chatStore.messages[0].messageId).to.equal("2");
		});
	});

	describe("updateMessage", () => {
		it("updates a message", () => {
			chatStore.addMessage(createMessage("1", "Original"));

			chatStore.updateMessage(createMessage("1", "Updated"));

			expect(chatStore.messages[0].text).to.equal("Updated");
		});

		it("does not affect other messages", () => {
			chatStore.addMessage(createMessage("1", "First"));
			chatStore.addMessage(createMessage("2", "Second"));

			chatStore.updateMessage(createMessage("1", "Updated"));

			expect(chatStore.messages[1].text).to.equal("Second");
		});
	});

	describe("setMessages", () => {
		it("replaces all messages", () => {
			chatStore.addMessage(createMessage("old"));

			chatStore.setMessages([
				createMessage("new1"),
				createMessage("new2"),
			]);

			expect(chatStore.messages).to.have.length(2);
			expect(chatStore.messages[0].messageId).to.equal("new1");
		});
	});

	describe("unreadMessages", () => {
		it("returns 0 for empty store", () => {
			expect(chatStore.unreadMessages).to.equal(0);
		});

		it("counts unread messages", () => {
			chatStore.addMessage(createMessage("1", "Text", false));
			chatStore.addMessage(createMessage("2", "Text", false));
			chatStore.addMessage(createMessage("3", "Text", true));

			expect(chatStore.unreadMessages).to.equal(2);
		});

		it("excludes deleted messages", () => {
			chatStore.addMessage(createMessage("1", "Text", false, false));
			chatStore.addMessage(createMessage("2", "Text", false, true));

			expect(chatStore.unreadMessages).to.equal(1);
		});
	});

	describe("getMessageById", () => {
		it("returns message by ID", () => {
			chatStore.addMessage(createMessage("1", "First"));
			chatStore.addMessage(createMessage("2", "Second"));

			const found = chatStore.getMessageById("2");

			expect(found).to.exist;
			expect(found!.text).to.equal("Second");
		});

		it("returns undefined for non-existent ID", () => {
			chatStore.addMessage(createMessage("1"));

			const found = chatStore.getMessageById("999");

			expect(found).to.be.undefined;
		});
	});

	describe("reset", () => {
		it("clears all messages", () => {
			chatStore.addMessage(createMessage("1"));
			chatStore.addMessage(createMessage("2"));

			chatStore.reset();

			expect(chatStore.messages).to.have.length(0);
		});
	});
});

