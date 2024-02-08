import { expect, html, fixture, oneEvent } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import "@shoelace-style/shoelace";

import { ModalController } from "./modal.controller.js";
import { EntryModal } from "../entry-modal/entry.modal.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service";
import { RootController } from "./root.controller.js";

describe("ModalController", () => {
	const modalName = "EntryModal";

	let modalController: ModalController;
	let modal: EntryModal;

	beforeEach(async () => {
		const element: LecturePlayer = await fixture(html`<lecture-player></lecture-player>`);

		const context: ApplicationContext = {
			eventEmitter: new EventEmitter(),
			host: element,
			chatService: new ChatService(),
			moderationService: new ModerationService(),
		}

		const rootController = new RootController(context);

		modalController = rootController.modalController;
		modal = new EntryModal();
	});

	it("registers modal", async () => {
		modalController.registerModal(modalName, modal, false, false);

		expect(modalController.hasModalRegistered(modalName)).to.true;
	});

	it("registers and opens modal", async () => {
		modalController.registerModal(modalName, modal);

		await oneEvent(modal, "sl-after-show");

		// Modal has been registered and opened automatically.
		expect(modalController.hasModalRegistered(modalName)).to.true;
		expect(modal.dialog.open).to.true;
	});

	it("registers and unregisters modal on close", async () => {
		modalController.registerModal(modalName, modal);

		await oneEvent(modal, "sl-after-show");

		expect(modal.dialog.open).to.true;

		modal.close();

		await oneEvent(modal, "sl-after-hide");

		// Modal has been unregistered automatically.
		expect(modalController.hasModalRegistered(modalName)).to.false;
	});

	it("opens modal", async () => {
		modalController.registerModal(modalName, modal, false, false);
		modalController.openModal(modalName);

		await oneEvent(modal, "sl-after-show");

		// The modal must be opened now.
		expect(modal.dialog.open).to.true;
	});

	it("closes modal", async () => {
		modalController.registerModal(modalName, modal, false, false);
		modalController.openModal(modalName);

		await oneEvent(modal, "sl-after-show");

		modalController.closeModal(modalName);

		// The modal must be closed now.
		expect(modal.dialog.open).to.false;

		// The modal must still be registered.
		expect(modalController.hasModalRegistered(modalName)).to.true;
	});

	it("closes and unregisters modal", async () => {
		modalController.registerModal(modalName, modal, false, false);
		modalController.openModal(modalName);

		await oneEvent(modal, "sl-after-show");

		modalController.closeAndDeleteModal(modalName);

		// The modal must be closed now.
		expect(modal.dialog.open).to.false;

		// The modal must be unregistered now.
		expect(modalController.hasModalRegistered(modalName)).to.false;
	});

	it("closes all modals", async () => {
		modalController.registerModal(modalName + "1", modal);
		modalController.registerModal(modalName + "2", modal);

		expect(modalController.hasModalRegistered(modalName + "1")).to.true;
		expect(modalController.hasModalRegistered(modalName + "2")).to.true;

		modalController.closeAllModals();

		expect(modalController.hasModalRegistered(modalName + "1")).to.false;
		expect(modalController.hasModalRegistered(modalName + "2")).to.false;
	});
});
