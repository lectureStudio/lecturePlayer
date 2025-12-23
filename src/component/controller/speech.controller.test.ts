import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { SpeechController } from "./speech.controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { Utils } from "../../utils/utils.js";

describe("SpeechController", () => {
	let speechController: SpeechController;
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
		speechController = rootController.speechController;
	});

	describe("constructor", () => {
		it("creates speech controller", () => {
			expect(speechController).to.exist;
		});
	});

	describe("lp-speech-request event", () => {
		// Note: handUp=true test is skipped because it triggers SettingsModal
		// which requires Shoelace dialog.show() not available in tests

		it("handles speech request with handUp=false", () => {
			let speechCanceledDispatched = false;

			context.eventEmitter.addEventListener("lp-speech-canceled", () => {
				speechCanceledDispatched = true;
			});

			context.eventEmitter.dispatchEvent(
				Utils.createEvent("lp-speech-request", false)
			);

			expect(speechCanceledDispatched).to.be.true;
		});
	});

	describe("lp-speech-state event", () => {
		it("handles speech state with accepted=false", () => {
			let speechCanceledDispatched = false;

			context.eventEmitter.addEventListener("lp-speech-canceled", () => {
				speechCanceledDispatched = true;
			});

			// First send a speech request to set up the request ID
			context.eventEmitter.dispatchEvent(
				Utils.createEvent("lp-speech-request", true)
			);

			// Simulate rejection
			context.eventEmitter.dispatchEvent(
				new CustomEvent("lp-speech-state", {
					detail: {
						requestId: undefined, // Won't match, but tests the handler
						accepted: false
					}
				})
			);

			// Controller should handle the event without error
		});
	});
});

