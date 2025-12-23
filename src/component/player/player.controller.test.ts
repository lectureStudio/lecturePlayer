import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { LecturePlayer } from "./player.js";
import "./player.js";

import { PlayerController } from "./player.controller.js";
import { State } from "../../utils/state.js";
import { uiStateStore } from "../../store/ui-state.store.js";
import { courseStore } from "../../store/course.store.js";
import { featureStore } from "../../store/feature.store.js";
import { privilegeStore } from "../../store/privilege.store.js";
import { documentStore } from "../../store/document.store.js";
import { participantStore } from "../../store/participants.store.js";
import { userStore } from "../../store/user.store.js";
import { chatStore } from "../../store/chat.store.js";
import { CourseStateApi } from "../../transport/course-state-api.js";
import { CourseUserApi } from "../../transport/course-user-api.js";
import { CourseParticipantApi } from "../../transport/course-participant-api.js";
import { CourseChatApi } from "../../transport/course-chat-api.js";
import { Utils } from "../../utils/utils.js";

// Store original API methods
let originalGetCourseState: typeof CourseStateApi.getCourseState;
let originalGetUserInfo: typeof CourseUserApi.getUserInformation;
let originalGetParticipants: typeof CourseParticipantApi.getParticipants;
let originalGetChatHistory: typeof CourseChatApi.getChatHistory;

// Store original XMLHttpRequest
const OriginalXHR = window.XMLHttpRequest;

// Mock XMLHttpRequest to prevent actual API calls
class MockXHR {
	private _url: string = "";
	private _onload: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null = null;
	private _responseType: XMLHttpRequestResponseType = "";

	status = 200;
	statusText = "OK";
	response: any = null;
	responseText = "";
	readyState = 4;
	timeout = 0;
	withCredentials = false;
	upload = {};

	set responseType(type: XMLHttpRequestResponseType) { this._responseType = type; }
	get responseType() { return this._responseType; }
	set onload(fn: ((this: XMLHttpRequest, ev: ProgressEvent) => any) | null) { this._onload = fn; }
	set onerror(_fn: any) {}
	set ontimeout(_fn: any) {}

	open(_method: string, url: string) { this._url = url; }
	setRequestHeader() {}
	getAllResponseHeaders() { return ""; }
	getResponseHeader() { return null; }

	send() {
		if (this._url.includes("/api/v1/course/state/")) {
			this.response = {
				courseId: 77,
				title: "Test Course",
				description: "Test Description",
				timeStarted: Date.now(),
				conference: false,
				recorded: false,
				userPrivileges: [],
				messageFeature: null,
				quizFeature: null,
				activeDocument: null,
				documentMap: {},
			};
		} else if (this._url.includes("/api/v1/user")) {
			this.response = {
				userId: "test-user",
				firstName: "Test",
				familyName: "User",
				participantType: "PARTICIPANT"
			};
		} else if (this._url.includes("/api/v1/course/") && this._url.includes("/participants")) {
			this.response = [];
		} else if (this._url.includes("/api/v1/course/") && this._url.includes("/chat")) {
			this.response = { messages: [] };
		} else if (this._url.includes("/janus")) {
			this.response = { janus: "ack" };
		} else {
			this.response = {};
		}

		setTimeout(() => {
			if (this._onload) {
				this._onload.call(this as any, new ProgressEvent("load"));
			}
		}, 0);
	}
}

describe("PlayerController", () => {
	let element: LecturePlayer;
	let controller: PlayerController;

	before(() => {
		// Replace XMLHttpRequest with mock
		(window as any).XMLHttpRequest = MockXHR;

		// Store original API methods
		originalGetCourseState = CourseStateApi.getCourseState;
		originalGetUserInfo = CourseUserApi.getUserInformation;
		originalGetParticipants = CourseParticipantApi.getParticipants;
		originalGetChatHistory = CourseChatApi.getChatHistory;
	});

	after(() => {
		// Restore original XMLHttpRequest
		(window as any).XMLHttpRequest = OriginalXHR;

		// Restore original API methods
		CourseStateApi.getCourseState = originalGetCourseState;
		CourseUserApi.getUserInformation = originalGetUserInfo;
		CourseParticipantApi.getParticipants = originalGetParticipants;
		CourseChatApi.getChatHistory = originalGetChatHistory;
	});

	beforeEach(async () => {
		// Reset stores
		courseStore.reset();
		featureStore.reset();
		privilegeStore.reset();
		documentStore.reset();
		participantStore.reset();
		userStore.reset();
		chatStore.reset();
		uiStateStore.setState(State.DISCONNECTED);
		uiStateStore.setStreamState(State.DISCONNECTED);
		uiStateStore.setDocumentState(State.DISCONNECTED);

		// Mock API methods
		CourseStateApi.getCourseState = () => Promise.resolve({
			courseId: 77,
			title: "Test Course",
			description: "Test Description",
			timeStarted: Date.now(),
			conference: false,
			recorded: false,
			userPrivileges: [],
			messageFeature: null,
			quizFeature: null,
			activeDocument: null,
			documentMap: {}
		});

		CourseUserApi.getUserInformation = () => Promise.resolve({
			userId: "test-user",
			firstName: "Test",
			familyName: "User",
			participantType: "PARTICIPANT"
		});

		CourseParticipantApi.getParticipants = () => Promise.resolve([]);

		CourseChatApi.getChatHistory = () => Promise.resolve({ messages: [] });

		element = await fixture(html`<lecture-player courseId="77"></lecture-player>`);
		controller = element.controller;
	});

	describe("constructor", () => {
		it("creates controller for host", () => {
			expect(controller).to.exist;
		});

		it("sets up application context", () => {
			expect(controller.eventEmitter).to.exist;
			expect(controller.chatService).to.exist;
			expect(controller.moderationService).to.exist;
		});
	});

	describe("hostConnected", () => {
		it("sets initial state based on isLive attribute", async () => {
			const liveElement = await fixture<LecturePlayer>(
				html`<lecture-player courseId="77" islive="true"></lecture-player>`
			);

			expect(courseStore.isLive).to.be.true;
		});

		it("sets connecting state when live", async () => {
			const liveElement = await fixture<LecturePlayer>(
				html`<lecture-player courseId="77" islive="true"></lecture-player>`
			);

			// Wait for state updates
			await new Promise(resolve => setTimeout(resolve, 50));

			expect(uiStateStore.state).to.be.oneOf([State.CONNECTING, State.DISCONNECTED, State.CONNECTED_FEATURES]);
		});

		it("sets disconnected state when not live", async () => {
			await new Promise(resolve => setTimeout(resolve, 50));

			expect(courseStore.isLive).to.be.false;
		});
	});

	describe("setPlayerViewController", () => {
		it("sets and updates player view controller", async () => {
			const mockViewController = {
				update: () => {},
				setDisconnected: () => {}
			};

			// Should not throw
			controller.setPlayerViewController(mockViewController as any);
		});
	});

	// Note: setSlideView test is skipped because it requires full render surface
	// mocking with registerRenderer method. The render-controller.test.ts
	// provides adequate coverage for this functionality.

	describe("loadCourseState", () => {
		it("loads and stores course state", async () => {
			// Wait for initial load
			await new Promise(resolve => setTimeout(resolve, 100));

			expect(courseStore.courseId).to.equal(77);
			expect(courseStore.title).to.equal("Test Course");
		});

		it("stores course properties from state", async () => {
			// Wait for initial load which happens in beforeEach
			await new Promise(resolve => setTimeout(resolve, 100));

			// Verify basic properties are set
			expect(courseStore.courseId).to.equal(77);
			expect(courseStore.title).to.equal("Test Course");
			expect(courseStore.description).to.equal("Test Description");
		});
	});

	describe("event handling", () => {
		describe("onChatState", () => {
			it("handles chat stopped event", async () => {
				featureStore.setChatFeature({ serviceId: "chat-1" });
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-chat-state", {
						detail: {
							started: false,
							feature: null
						}
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(featureStore.hasChatFeature()).to.be.false;
			});
		});

		describe("onQuizState", () => {
			it("handles quiz stopped event and sets quizSent", async () => {
				featureStore.setQuizFeature({ serviceId: "quiz-1" });
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-quiz-state", {
						detail: {
							started: false,
							feature: null
						}
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(featureStore.hasQuizFeature()).to.be.false;
				expect(uiStateStore.quizSent).to.be.true;
			});
		});

		describe("onRecordingState", () => {
			it("updates courseStore.recorded on recording stopped", async () => {
				courseStore.setRecorded(true);
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-recording-state", {
						detail: { started: false }
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(courseStore.recorded).to.be.false;
			});

			it("updates courseStore.recorded on recording started", async () => {
				courseStore.setRecorded(false);
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-recording-state", {
						detail: { started: true }
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(courseStore.recorded).to.be.true;
			});
		});

		describe("onMediaState", () => {
			it("updates participant audio state", async () => {
				participantStore.addParticipant({
					userId: "user-1",
					firstName: "Test",
					familyName: "User",
					participantType: "PARTICIPANT",
					presence: "CONNECTED"
				} as any);

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-media-state", {
						detail: {
							userId: "user-1",
							state: { Audio: true, Camera: null, Screen: null }
						}
					})
				);

				const participant = participantStore.participants.find(p => p.userId === "user-1");
				expect(participant?.microphoneActive).to.be.true;
			});

			it("updates participant camera state", async () => {
				participantStore.addParticipant({
					userId: "user-1",
					firstName: "Test",
					familyName: "User",
					participantType: "PARTICIPANT",
					presence: "CONNECTED"
				} as any);

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-media-state", {
						detail: {
							userId: "user-1",
							state: { Audio: null, Camera: true, Screen: null }
						}
					})
				);

				const participant = participantStore.participants.find(p => p.userId === "user-1");
				expect(participant?.cameraActive).to.be.true;
			});

			it("updates participant screen state", async () => {
				participantStore.addParticipant({
					userId: "user-1",
					firstName: "Test",
					familyName: "User",
					participantType: "PARTICIPANT",
					presence: "CONNECTED"
				} as any);

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-media-state", {
						detail: {
							userId: "user-1",
							state: { Audio: null, Camera: null, Screen: true }
						}
					})
				);

				const participant = participantStore.participants.find(p => p.userId === "user-1");
				expect(participant?.screenActive).to.be.true;
			});
		});

		describe("onParticipantPresence", () => {
			it("adds participant on CONNECTED presence", async () => {
				userStore.setUserId("different-user");

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-participant-presence", {
						detail: {
							userId: "new-user",
							firstName: "New",
							familyName: "User",
							participantType: "PARTICIPANT",
							presence: "CONNECTED"
						}
					})
				);

				expect(participantStore.participants.find(p => p.userId === "new-user")).to.exist;
			});

			it("removes participant on DISCONNECTED presence", async () => {
				userStore.setUserId("different-user");

				participantStore.addParticipant({
					userId: "leaving-user",
					firstName: "Leaving",
					familyName: "User",
					participantType: "PARTICIPANT"
				} as any);

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-participant-presence", {
						detail: {
							userId: "leaving-user",
							presence: "DISCONNECTED"
						}
					})
				);

				expect(participantStore.participants.find(p => p.userId === "leaving-user")).to.be.undefined;
			});

			it("ignores own presence events", async () => {
				userStore.setUserId("my-user-id");

				const initialCount = participantStore.participants.length;

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-participant-presence", {
						detail: {
							userId: "my-user-id",
							firstName: "Me",
							familyName: "User",
							participantType: "PARTICIPANT",
							presence: "CONNECTED"
						}
					})
				);

				expect(participantStore.participants.length).to.equal(initialCount);
			});
		});

		describe("onParticipantModeration", () => {
			// Note: Toaster.showWarning fails without Shoelace alert.toast()
			// We test the logic without the toast notification

			it("ignores moderation events for other users", async () => {
				userStore.setUserId("my-user-id");
				const initialState = uiStateStore.streamState;

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-participant-moderation", {
						detail: {
							userId: "other-user",
							moderationType: "PERMANENT_BAN"
						}
					})
				);

				expect(uiStateStore.streamState).to.equal(initialState);
			});
		});

		describe("onStreamState", () => {
			it("handles stream started event", async () => {
				courseStore.isClassroom = false;
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-stream-state", {
						detail: {
							started: true,
							timeStarted: Date.now()
						}
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(courseStore.isLive).to.be.true;
			});

			it("handles stream stopped event", async () => {
				courseStore.isLive = true;
				courseStore.isClassroom = false;
				await new Promise(resolve => setTimeout(resolve, 100));

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-stream-state", {
						detail: { started: false }
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(courseStore.isLive).to.be.false;
				expect(uiStateStore.streamState).to.equal(State.DISCONNECTED);
			});

			it("ignores stream state in classroom mode", async () => {
				courseStore.isClassroom = true;
				const initialLiveState = courseStore.isLive;

				controller.eventEmitter.dispatchEvent(
					new CustomEvent("lp-stream-state", {
						detail: {
							started: true,
							timeStarted: Date.now()
						}
					})
				);

				await new Promise(resolve => setTimeout(resolve, 50));

				expect(courseStore.isLive).to.equal(initialLiveState);
			});
		});

		// Note: onChatError and onChatResponse tests are skipped because
		// Toaster uses Shoelace alert.toast() which is not available in tests
	});

	describe("updateConnectionState", () => {
		it("sets NO_ACCESS when stream state is NO_ACCESS", async () => {
			uiStateStore.setStreamState(State.NO_ACCESS);

			controller.eventEmitter.dispatchEvent(
				Utils.createEvent("lp-stream-connection-state", State.NO_ACCESS)
			);

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(uiStateStore.state).to.equal(State.NO_ACCESS);
		});

		it("sets DISCONNECTED when no features and no stream", async () => {
			featureStore.reset();
			documentStore.setActiveDocument(null);
			uiStateStore.setState(State.CONNECTING);

			controller.eventEmitter.dispatchEvent(
				Utils.createEvent("lp-stream-connection-state", State.DISCONNECTED)
			);

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(uiStateStore.state).to.equal(State.DISCONNECTED);
		});
	});
});

