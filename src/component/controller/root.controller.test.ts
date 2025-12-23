import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { DocumentController } from "./document.controller.js";
import { ModalController } from "./modal.controller.js";
import { PlaybackController } from "./playback.controller.js";
import { SpeechController } from "./speech.controller.js";
import { StreamController } from "./stream.controller.js";
import { ViewController } from "./view.controller.js";
import { RenderController } from "../../render/render-controller.js";

describe("RootController", () => {
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
	});

	describe("constructor", () => {
		it("creates root controller with context", () => {
			expect(rootController).to.exist;
		});
	});

	describe("child controllers", () => {
		it("initializes renderController", () => {
			expect(rootController.renderController).to.be.instanceOf(RenderController);
		});

		it("initializes documentController", () => {
			expect(rootController.documentController).to.be.instanceOf(DocumentController);
		});

		it("initializes modalController", () => {
			expect(rootController.modalController).to.be.instanceOf(ModalController);
		});

		it("initializes playbackController", () => {
			expect(rootController.playbackController).to.be.instanceOf(PlaybackController);
		});

		it("initializes speechController", () => {
			expect(rootController.speechController).to.be.instanceOf(SpeechController);
		});

		it("initializes streamController", () => {
			expect(rootController.streamController).to.be.instanceOf(StreamController);
		});

		it("initializes viewController", () => {
			expect(rootController.viewController).to.be.instanceOf(ViewController);
		});
	});

	describe("controller interactions", () => {
		it("all controllers share the same render controller", () => {
			const render1 = rootController.playbackController.renderController;
			const render2 = rootController.renderController;
			expect(render1).to.equal(render2);
		});

		it("all controllers share the same modal controller", () => {
			const modal1 = rootController.playbackController.modalController;
			const modal2 = rootController.modalController;
			expect(modal1).to.equal(modal2);
		});
	});
});

