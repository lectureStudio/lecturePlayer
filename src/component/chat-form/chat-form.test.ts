import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { ChatForm } from "./chat-form.js";
import "./chat-form.js";

describe("ChatForm", () => {
	let element: ChatForm;

	beforeEach(async () => {
		element = await fixture(html`<chat-form></chat-form>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("chat-form");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders form element", async () => {
			await elementUpdated(element);
			const form = element.shadowRoot!.querySelector("form");
			expect(form).to.exist;
			expect(form!.id).to.equal("course-message-form");
		});

		it("renders recipient container", async () => {
			await elementUpdated(element);
			const container = element.shadowRoot!.querySelector(".recipient-container");
			expect(container).to.exist;
		});

		it("renders recipient select", async () => {
			await elementUpdated(element);
			const select = element.shadowRoot!.querySelector("sl-select#recipients");
			expect(select).to.exist;
		});

		it("renders message container", async () => {
			await elementUpdated(element);
			const container = element.shadowRoot!.querySelector(".message-container");
			expect(container).to.exist;
		});

		it("renders textarea", async () => {
			await elementUpdated(element);
			const textarea = element.shadowRoot!.querySelector("sl-textarea[name='text']");
			expect(textarea).to.exist;
		});

		it("renders slot for right pane", async () => {
			await elementUpdated(element);
			const slot = element.shadowRoot!.querySelector("slot[name='right-pane']");
			expect(slot).to.exist;
		});
	});

	describe("replying property", () => {
		it("defaults to false", () => {
			expect(element.replying).to.be.false;
		});
	});

	describe("chatService property", () => {
		it("accepts chat service via property", async () => {
			const mockService = { postMessage: () => Promise.resolve() };
			element.chatService = mockService as any;
			expect(element.chatService).to.equal(mockService);
		});
	});

	describe("getFormData", () => {
		it("returns FormData object", async () => {
			await elementUpdated(element);
			const formData = element.getFormData();
			expect(formData).to.be.instanceOf(FormData);
		});
	});

	describe("resetForm", () => {
		it("clears resettable form elements", async () => {
			await elementUpdated(element);
			// Should not throw
			element.resetForm();
		});
	});

	describe("notifyAboutMessageSending", () => {
		it("sets replying to false when true", () => {
			// Set replying directly without triggering render which needs store data
			(element as any).replying = true;
			element.notifyAboutMessageSending();
			expect(element.replying).to.be.false;
		});
	});

	describe("getMessageToReplyTo", () => {
		it("returns undefined when not replying", () => {
			expect(element.getMessageToReplyTo()).to.be.undefined;
		});
	});
});

