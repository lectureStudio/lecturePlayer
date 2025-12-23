import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { DocumentNavigation } from "./document-navigation.js";
import "./document-navigation.js";

describe("DocumentNavigation", () => {
	let element: DocumentNavigation;

	beforeEach(async () => {
		element = await fixture(html`<document-navigation></document-navigation>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("document-navigation");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("toolType state", () => {
		it("starts as null or undefined", () => {
			expect(element.toolType).to.satisfy((v: any) => v === null || v === undefined);
		});
	});

	describe("tool button state", () => {
		it("updates tool button active state on update", async () => {
			await elementUpdated(element);
			// Should not throw
			element.requestUpdate();
			await elementUpdated(element);
		});
	});
});

