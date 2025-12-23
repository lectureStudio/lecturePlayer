import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { LecturePlayer } from "./player.js";
import "./player.js";

import { State } from "../../utils/state.js";
import { uiStateStore } from "../../store/ui-state.store.js";

// Store original XMLHttpRequest
const OriginalXHR = window.XMLHttpRequest;

// Mock XMLHttpRequest to prevent actual API calls
class MockXHR {
	private _url: string = "";
	private _method: string = "";
	private _responseType: XMLHttpRequestResponseType = "";
	private _onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
	private _onerror: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;

	status = 200;
	statusText = "OK";
	response: any = null;
	responseText = "";
	readyState = 4;
	timeout = 0;
	withCredentials = false;
	upload = {};

	set responseType(type: XMLHttpRequestResponseType) {
		this._responseType = type;
	}
	get responseType() {
		return this._responseType;
	}

	set onload(fn: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null) {
		this._onload = fn;
	}
	set onerror(fn: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null) {
		this._onerror = fn;
	}
	set ontimeout(_fn: any) {}

	open(method: string, url: string) {
		this._method = method;
		this._url = url;
	}

	setRequestHeader() {}
	getAllResponseHeaders() { return ""; }
	getResponseHeader() { return null; }

	send() {
		// Mock API responses
		if (this._url.includes("/api/v1/course/state/")) {
			this.response = {
				courseId: 77,
				title: "Test Course",
				description: "Test Description",
				timeStarted: Date.now(),
				conference: false,
				recorded: false,
				userPrivileges: [],
				messageFeature: { enabled: false },
				quizFeature: { enabled: false },
				activeDocument: null,
				documentMap: {},
			};
		} else if (this._url.includes("/api/v1/user")) {
			this.response = {
				userId: "test-user",
				firstName: "Test",
				familyName: "User",
			};
		} else {
			this.response = {};
		}

		// Simulate async response
		setTimeout(() => {
			if (this._onload) {
				this._onload.call(this as any, new ProgressEvent("load"));
			}
		}, 0);
	}
}

async function changeState(element: LecturePlayer, state: State) {
	uiStateStore.setState(state);

	await elementUpdated(element);
}

describe("Lecture Player", () => {
	let element: LecturePlayer;

	before(() => {
		// Replace XMLHttpRequest with mock
		(window as any).XMLHttpRequest = MockXHR;
	});

	after(() => {
		// Restore original XMLHttpRequest
		(window as any).XMLHttpRequest = OriginalXHR;
	});

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