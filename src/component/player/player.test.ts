import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { LecturePlayer } from "./player.js";
import "./player.js";

import { State } from "../../utils/state.js";
import { uiStateStore } from "../../store/ui-state.store.js";

async function changeState(element: LecturePlayer, state: State) {
	uiStateStore.setState(state);

	await elementUpdated(element);
}

describe("Lecture Player", () => {
	let element: LecturePlayer;

	beforeEach(async () => {
		element = await fixture(html`<lecture-player></lecture-player>`);
	});

	it("has controller", async () => {
		await elementUpdated(element);

		expect(element.controller).not.null;
	});

	it("can override courseId via attribute", async () => {
		const courseId = 77;
		const element = await fixture<LecturePlayer>(
			html`<lecture-player courseId="${courseId}"></lecture-player>`,
		);

		await elementUpdated(element);

		expect(element.courseId).to.equal(courseId);
	});

	it("default disconnected state", async () => {
		await expect(uiStateStore.state).to.equal(State.DISCONNECTED);

		expect(element.shadowRoot!.querySelector("player-offline")).not.null;
	});

	it("connected feature state", async () => {
		await changeState(element, State.CONNECTED_FEATURES);

		expect(element.shadowRoot!.querySelector("player-feature-view")).not.null;
	});

	it("connecting state", async () => {
		await changeState(element, State.CONNECTING);

		expect(element.shadowRoot!.querySelector("player-loading")).not.null;
	});

	it("connected state", async () => {
		await changeState(element, State.CONNECTED);

		expect(element.shadowRoot!.querySelector("player-view")).not.null;
	});
});