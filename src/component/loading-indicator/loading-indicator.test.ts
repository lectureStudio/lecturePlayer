import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { LoadingIndicator } from "./loading-indicator";
import "./loading-indicator";

describe("Loading Indicator", () => {
	let element: LoadingIndicator;

	beforeEach(async () => {
		element = await fixture(html`<loading-indicator></loading-indicator>`);
	});

	it("renders custom text", async () => {
		const text = "Course is loading!";
		element.text = text;

		await elementUpdated(element);

		const span = element.shadowRoot!.querySelector("span")!;

		expect(span).to.exist;
		expect(span.textContent).to.equal(text);
	});
});
