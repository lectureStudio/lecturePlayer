import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { PlayerNoAccess } from "./no-access.js";
import "./no-access.js";

describe("PlayerNoAccess", () => {
	let element: PlayerNoAccess;

	beforeEach(async () => {
		element = await fixture(html`<player-no-access></player-no-access>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("player-no-access");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});

		it("renders shield-x icon", async () => {
			await elementUpdated(element);
			const icon = element.shadowRoot!.querySelector("sl-icon");
			expect(icon).to.exist;
			expect(icon!.getAttribute("name")).to.equal("shield-x");
		});

		it("renders title heading", async () => {
			await elementUpdated(element);
			const heading = element.shadowRoot!.querySelector("h1");
			expect(heading).to.exist;
		});

		it("renders description paragraph", async () => {
			await elementUpdated(element);
			const paragraph = element.shadowRoot!.querySelector("p");
			expect(paragraph).to.exist;
		});

		it("renders home button", async () => {
			await elementUpdated(element);
			const button = element.shadowRoot!.querySelector("sl-button");
			expect(button).to.exist;
		});
	});

	describe("structure", () => {
		it("wraps content in a div", async () => {
			await elementUpdated(element);
			const div = element.shadowRoot!.querySelector("div");
			expect(div).to.exist;

			// All elements should be inside the div
			const icon = div!.querySelector("sl-icon");
			const heading = div!.querySelector("h1");
			const button = div!.querySelector("sl-button");

			expect(icon).to.exist;
			expect(heading).to.exist;
			expect(button).to.exist;
		});
	});
});

