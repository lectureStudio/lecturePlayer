import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { PlayerOffline } from "./player-offline.js";
import "./player-offline.js";

import { uiStateStore } from "../../store/ui-state.store.js";

describe("PlayerOffline", () => {
	let element: PlayerOffline;

	beforeEach(async () => {
		// Reset store state
		uiStateStore.streamProbeFailed = false;
		element = await fixture(html`<player-offline></player-offline>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("player-offline");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});

		it("wraps content in a div", async () => {
			await elementUpdated(element);
			const div = element.shadowRoot!.querySelector("div");
			expect(div).to.exist;
		});
	});

	describe("normal offline state", () => {
		it("renders calendar-x icon when stream probe not failed", async () => {
			uiStateStore.streamProbeFailed = false;
			await elementUpdated(element);

			const icon = element.shadowRoot!.querySelector("sl-icon[name='calendar-x']");
			expect(icon).to.exist;
		});

		it("shows unavailable message when stream probe not failed", async () => {
			uiStateStore.streamProbeFailed = false;
			await elementUpdated(element);

			const strong = element.shadowRoot!.querySelector("strong");
			expect(strong).to.exist;
		});
	});

	describe("stream probe failed state", () => {
		it("renders shield-exclamation icon when stream probe failed", async () => {
			uiStateStore.streamProbeFailed = true;
			element.requestUpdate();
			await elementUpdated(element);

			const icon = element.shadowRoot!.querySelector("sl-icon[name='shield-exclamation']");
			expect(icon).to.exist;
		});

		it("shows VPN warning alert when stream probe failed", async () => {
			uiStateStore.streamProbeFailed = true;
			element.requestUpdate();
			await elementUpdated(element);

			const alert = element.shadowRoot!.querySelector("sl-alert[variant='warning']");
			expect(alert).to.exist;
		});
	});

	describe("structure", () => {
		it("renders divider", async () => {
			await elementUpdated(element);
			const divider = element.shadowRoot!.querySelector("sl-divider");
			expect(divider).to.exist;
		});

		it("renders small element for description", async () => {
			await elementUpdated(element);
			const small = element.shadowRoot!.querySelector("small");
			expect(small).to.exist;
		});
	});
});

