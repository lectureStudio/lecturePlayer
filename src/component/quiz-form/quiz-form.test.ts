import { html } from "lit";
import { fixture, expect, elementUpdated, oneEvent } from "@open-wc/testing";

import type { QuizForm } from "./quiz-form.js";
import "./quiz-form.js";

describe("QuizForm", () => {
	let element: QuizForm;

	beforeEach(async () => {
		element = await fixture(html`<quiz-form></quiz-form>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("quiz-form");
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
			expect(form!.id).to.equal("quiz-form");
		});

		it("renders hidden serviceId input", async () => {
			await elementUpdated(element);
			const hiddenInput = element.shadowRoot!.querySelector("input[type='hidden'][name='serviceId']");
			expect(hiddenInput).to.exist;
		});

		it("renders quiz question container", async () => {
			await elementUpdated(element);
			const questionDiv = element.shadowRoot!.querySelector(".quiz-question");
			expect(questionDiv).to.exist;
		});

		it("renders quiz options container", async () => {
			await elementUpdated(element);
			const optionsDiv = element.shadowRoot!.querySelector(".quiz-options");
			expect(optionsDiv).to.exist;
		});
	});

	describe("fieldErrors property", () => {
		it("defaults to empty object", () => {
			expect(element.fieldErrors).to.deep.equal({});
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

	describe("setResponse", () => {
		it("sets field errors from response", () => {
			const response = {
				statusCode: 1,
				statusMessage: "error",
				fieldErrors: { 0: "Field error" }
			};

			element.setResponse(response);

			expect(element.fieldErrors).to.deep.equal({ 0: "Field error" });
		});

		it("handles response without field errors", () => {
			const response = {
				statusCode: 0,
				statusMessage: "success"
			};

			element.setResponse(response as any);

			expect(element.fieldErrors).to.deep.equal({});
		});
	});

	describe("quiz-submit event", () => {
		it("dispatches quiz-submit event on Enter key", async () => {
			await elementUpdated(element);
			const form = element.shadowRoot!.querySelector("form") as HTMLFormElement;

			setTimeout(() => {
				form.dispatchEvent(new KeyboardEvent("keydown", {
					key: "Enter",
					bubbles: true,
					cancelable: true
				}));
			}, 0);

			const event = await oneEvent(element, "quiz-submit");
			expect(event).to.exist;
		});
	});
});

