import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { ThemeSettings } from "./theme-settings.js";
import "./theme-settings.js";

import { ColorScheme, uiStateStore } from "../../store/ui-state.store.js";

describe("ThemeSettings", () => {
	let element: ThemeSettings;

	beforeEach(async () => {
		// Reset to default
		uiStateStore.setColorScheme(ColorScheme.SYSTEM);
		element = await fixture(html`<theme-settings></theme-settings>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("theme-settings");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders select element", async () => {
			await elementUpdated(element);
			const select = element.shadowRoot!.querySelector("sl-select");
			expect(select).to.exist;
		});

		it("select has theme name attribute", async () => {
			await elementUpdated(element);
			const select = element.shadowRoot!.querySelector("sl-select");
			expect(select!.getAttribute("name")).to.equal("theme");
		});

		it("select has small size", async () => {
			await elementUpdated(element);
			const select = element.shadowRoot!.querySelector("sl-select");
			expect(select!.getAttribute("size")).to.equal("small");
		});
	});

	describe("theme options", () => {
		it("renders light theme option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector(`sl-option[value="${ColorScheme.LIGHT}"]`);
			expect(option).to.exist;
		});

		it("renders dark theme option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector(`sl-option[value="${ColorScheme.DARK}"]`);
			expect(option).to.exist;
		});

		it("renders system theme option", async () => {
			await elementUpdated(element);
			const option = element.shadowRoot!.querySelector(`sl-option[value="${ColorScheme.SYSTEM}"]`);
			expect(option).to.exist;
		});

		it("renders divider between options", async () => {
			await elementUpdated(element);
			const divider = element.shadowRoot!.querySelector("sl-divider");
			expect(divider).to.exist;
		});
	});

	describe("value binding", () => {
		it("reflects current color scheme", async () => {
			uiStateStore.setColorScheme(ColorScheme.DARK);
			element.requestUpdate();
			await elementUpdated(element);

			const select = element.shadowRoot!.querySelector("sl-select") as any;
			expect(select.value).to.equal(ColorScheme.DARK);
		});
	});
});

