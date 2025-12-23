import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { PlaybackController } from "./playback.controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { CourseStateDocument } from "../../model/course-state-document.js";

describe("PlaybackController", () => {
	let playbackController: PlaybackController;
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
		playbackController = rootController.playbackController;
	});

	describe("constructor", () => {
		it("creates playback controller", () => {
			expect(playbackController).to.exist;
		});
	});

	describe("start", () => {
		it("starts playback service", () => {
			// Should not throw
			playbackController.start();
		});
	});

	describe("setDocuments", () => {
		it("sets documents on playback service", () => {
			// Should not throw with empty array
			playbackController.setDocuments([]);
		});
	});

	describe("setActiveDocument", () => {
		it("throws error when active document has no active page", () => {
			const activeDoc: CourseStateDocument = {
				documentId: BigInt(1),
				documentFile: "test.pdf",
				activePage: null
			};

			expect(() => playbackController.setActiveDocument(activeDoc))
				.to.throw("Active document has no active page");
		});
	});

	describe("setDisconnected", () => {
		it("stops playback service", () => {
			// Should not throw
			playbackController.setDisconnected();
		});
	});

	describe("lp-participant-data event", () => {
		it("processes participant data", () => {
			// Create a mock ArrayBuffer
			const buffer = new ArrayBuffer(8);
			const view = new DataView(buffer);
			view.setInt32(0, 0); // streamDocumentType placeholder

			// Should not throw - even if action processor fails to parse,
			// the event handler should not propagate the error
			context.eventEmitter.dispatchEvent(
				new CustomEvent("lp-participant-data", {
					detail: { data: buffer }
				})
			);
		});
	});
});

