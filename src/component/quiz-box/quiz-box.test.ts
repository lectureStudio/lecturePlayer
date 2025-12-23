import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { QuizBox } from "./quiz-box.js";
import "./quiz-box.js";

import { uiStateStore } from "../../store/ui-state.store.js";

describe("QuizBox", () => {
	let element: QuizBox;

	beforeEach(async () => {
		// Reset store state
		uiStateStore.setQuizSent(false);
		element = await fixture(html`<quiz-box></quiz-box>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("quiz-box");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders header element", async () => {
			await elementUpdated(element);
			const header = element.shadowRoot!.querySelector("header");
			expect(header).to.exist;
			expect(header!.getAttribute("part")).to.equal("header");
		});

		it("renders section element", async () => {
			await elementUpdated(element);
			const section = element.shadowRoot!.querySelector("section");
			expect(section).to.exist;
			expect(section!.getAttribute("part")).to.equal("section");
		});

		it("renders footer element", async () => {
			await elementUpdated(element);
			const footer = element.shadowRoot!.querySelector("footer");
			expect(footer).to.exist;
			expect(footer!.getAttribute("part")).to.equal("footer");
		});

		it("renders quiz form", async () => {
			await elementUpdated(element);
			const quizForm = element.shadowRoot!.querySelector("quiz-form");
			expect(quizForm).to.exist;
		});

		it("renders submit button", async () => {
			await elementUpdated(element);
			const button = element.shadowRoot!.querySelector("sl-button#quiz-submit");
			expect(button).to.exist;
		});

		it("renders send icon in button", async () => {
			await elementUpdated(element);
			const icon = element.shadowRoot!.querySelector("sl-button#quiz-submit sl-icon[name='send']");
			expect(icon).to.exist;
		});
	});

	describe("submit button state", () => {
		it("button is enabled when quiz not sent", async () => {
			uiStateStore.setQuizSent(false);
			element.requestUpdate();
			await elementUpdated(element);

			const button = element.shadowRoot!.querySelector("sl-button#quiz-submit") as HTMLElement;
			expect(button.hasAttribute("disabled")).to.be.false;
		});

		it("button is disabled when quiz already sent", async () => {
			uiStateStore.setQuizSent(true);
			element.requestUpdate();
			await elementUpdated(element);

			const button = element.shadowRoot!.querySelector("sl-button#quiz-submit") as HTMLElement;
			expect(button.hasAttribute("disabled")).to.be.true;
		});
	});

	describe("quizForm property", () => {
		it("queries quiz-form element", async () => {
			await elementUpdated(element);
			expect(element.quizForm).to.exist;
		});
	});
});

