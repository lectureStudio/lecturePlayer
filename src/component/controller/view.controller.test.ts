import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { ViewController } from "./view.controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { ColorScheme, uiStateStore } from "../../store/ui-state.store.js";

describe("ViewController", () => {
	let viewController: ViewController;
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
		viewController = rootController.viewController;
	});

	describe("constructor", () => {
		it("creates view controller", () => {
			expect(viewController).to.exist;
		});
	});

	describe("setFullscreen", () => {
		it("handles fullscreen enable without throwing", () => {
			// Should not throw
			viewController.setFullscreen(true);
		});

		it("handles fullscreen disable without throwing", () => {
			// Should not throw
			viewController.setFullscreen(false);
		});
	});

	describe("update", () => {
		it("updates layout based on viewport", () => {
			// Should not throw
			viewController.update();
		});
	});

	describe("applyColorScheme", () => {
		afterEach(() => {
			// Clean up
			document.body.classList.remove("sl-theme-dark");
		});

		it("applies dark theme class when scheme is dark", () => {
			uiStateStore.setColorScheme(ColorScheme.DARK);
			viewController.applyColorScheme();

			expect(document.body.classList.contains("sl-theme-dark")).to.be.true;
		});

		it("removes dark theme class when scheme is light", () => {
			document.body.classList.add("sl-theme-dark");
			uiStateStore.setColorScheme(ColorScheme.LIGHT);
			viewController.applyColorScheme();

			expect(document.body.classList.contains("sl-theme-dark")).to.be.false;
		});
	});

	// Note: Event handling tests that trigger modals are skipped because
	// Shoelace dialog.show() is not available in the test environment
	// The modal.controller.test.ts covers modal functionality adequately
});

