import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { StreamController } from "./stream.controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { courseStore } from "../../store/course.store.js";
import { userStore } from "../../store/user.store.js";
import { uiStateStore } from "../../store/ui-state.store.js";
import { Utils } from "../../utils/utils.js";

describe("StreamController", () => {
	let streamController: StreamController;
	let rootController: RootController;
	let context: ApplicationContext;

	beforeEach(async () => {
		const host: LecturePlayer = await fixture(html`<lecture-player></lecture-player>`);

		context = {
			host,
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			moderationService: new ModerationService()
		};

		rootController = new RootController(context);
		streamController = rootController.streamController;

		// Reset stores
		courseStore.reset();
		userStore.reset();
	});

	describe("constructor", () => {
		it("creates stream controller", () => {
			expect(streamController).to.exist;
		});
	});

	describe("connect", () => {
		it("throws error if course id is not set", () => {
			courseStore.reset();
			userStore.userId = "user-1";

			expect(() => streamController.connect()).to.throw("Course id is not set");
		});

		it("throws error if user id is not set", () => {
			courseStore.courseId = 123;
			userStore.reset();

			expect(() => streamController.connect()).to.throw("User id is not set");
		});
	});

	// Note: startSpeech, stopSpeech, reconnect, and onPeerConnected tests are skipped
	// because they require a connected Janus WebRTC session which isn't available in tests

	describe("disconnect", () => {
		it("disconnects without throwing", () => {
			// Should not throw even without connection
			streamController.disconnect();
		});
	});

	describe("event handling", () => {
		it("handles lp-receive-camera-feed event", () => {
			const initialState = uiStateStore.receiveCameraFeed;

			context.eventEmitter.dispatchEvent(Utils.createEvent("lp-receive-camera-feed"));

			// State should toggle
			expect(uiStateStore.receiveCameraFeed).to.not.equal(initialState);
		});

		it("handles lp-stream-capture-stats event with true", () => {
			// Should not throw
			context.eventEmitter.dispatchEvent(Utils.createEvent("lp-stream-capture-stats", true));
		});

		it("handles lp-stream-capture-stats event with false", () => {
			// Should not throw
			context.eventEmitter.dispatchEvent(Utils.createEvent("lp-stream-capture-stats", false));
		});
	});
});

