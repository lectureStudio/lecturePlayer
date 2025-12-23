import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { SettingsButton } from "./settings-button.js";
import "./settings-button.js";

import { EventEmitter } from "../../utils/event-emitter.js";

describe("SettingsButton", () => {
	let element: SettingsButton;
	let eventEmitter: EventEmitter;

	beforeEach(async () => {
		eventEmitter = new EventEmitter();
		element = await fixture(html`
			<settings-button .eventEmitter="${eventEmitter}"></settings-button>
		`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("settings-button");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders dropdown", async () => {
			await elementUpdated(element);
			const dropdown = element.shadowRoot!.querySelector("sl-dropdown");
			expect(dropdown).to.exist;
		});

		it("renders tooltip", async () => {
			await elementUpdated(element);
			const tooltip = element.shadowRoot!.querySelector("sl-tooltip");
			expect(tooltip).to.exist;
		});

		it("renders trigger button", async () => {
			await elementUpdated(element);
			const button = element.shadowRoot!.querySelector("sl-button");
			expect(button).to.exist;
		});

		it("renders more-vertical icon", async () => {
			await elementUpdated(element);
			const icon = element.shadowRoot!.querySelector("sl-icon[name='more-vertical']");
			expect(icon).to.exist;
		});

		it("renders menu", async () => {
			await elementUpdated(element);
			const menu = element.shadowRoot!.querySelector("sl-menu");
			expect(menu).to.exist;
		});
	});

	describe("menu items", () => {
		it("renders camera feed menu item", async () => {
			await elementUpdated(element);
			const cameraFeed = element.shadowRoot!.querySelector("sl-menu-item#camera-feed");
			expect(cameraFeed).to.exist;
		});

		it("renders statistics menu item", async () => {
			await elementUpdated(element);
			const statsItem = element.shadowRoot!.querySelector("sl-menu-item sl-icon[name='stats']");
			expect(statsItem).to.exist;
		});

		it("renders settings menu item", async () => {
			await elementUpdated(element);
			const settingsItem = element.shadowRoot!.querySelector("sl-menu-item sl-icon[name='settings']");
			expect(settingsItem).to.exist;
		});

		it("renders divider", async () => {
			await elementUpdated(element);
			const divider = element.shadowRoot!.querySelector("sl-divider");
			expect(divider).to.exist;
		});
	});

	describe("event emitter", () => {
		it("accepts event emitter via property", () => {
			expect(element.eventEmitter).to.equal(eventEmitter);
		});
	});

	describe("query accessors", () => {
		it("queries menu element", async () => {
			await elementUpdated(element);
			expect(element.menu).to.exist;
		});

		it("queries tooltip element", async () => {
			await elementUpdated(element);
			expect(element.tooltip).to.exist;
		});

		it("queries cameraFeed element", async () => {
			await elementUpdated(element);
			expect(element.cameraFeed).to.exist;
		});
	});
});

