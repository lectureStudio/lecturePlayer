import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { Controller } from "./controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";

describe("Controller", () => {
	let controller: Controller;
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
		controller = new Controller(rootController, context);
	});

	describe("constructor", () => {
		it("creates controller with root controller and context", () => {
			expect(controller).to.exist;
		});
	});

	describe("eventEmitter getter", () => {
		it("returns event emitter from context", () => {
			expect(controller.eventEmitter).to.equal(context.eventEmitter);
		});
	});

	describe("chatService getter", () => {
		it("returns chat service from context", () => {
			expect(controller.chatService).to.equal(context.chatService);
		});
	});

	describe("moderationService getter", () => {
		it("returns moderation service from context", () => {
			expect(controller.moderationService).to.equal(context.moderationService);
		});
	});

	describe("documentController getter", () => {
		it("returns document controller from root controller", () => {
			expect(controller.documentController).to.equal(rootController.documentController);
		});
	});

	describe("modalController getter", () => {
		it("returns modal controller from root controller", () => {
			expect(controller.modalController).to.equal(rootController.modalController);
		});
	});

	describe("playbackController getter", () => {
		it("returns playback controller from root controller", () => {
			expect(controller.playbackController).to.equal(rootController.playbackController);
		});
	});

	describe("renderController getter", () => {
		it("returns render controller from root controller", () => {
			expect(controller.renderController).to.equal(rootController.renderController);
		});
	});

	describe("streamController getter", () => {
		it("returns stream controller from root controller", () => {
			expect(controller.streamController).to.equal(rootController.streamController);
		});
	});
});

