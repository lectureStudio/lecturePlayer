import { Modal } from "../modal/modal";
import { Controller } from "./controller";

export class ModalController extends Controller {

	private modals: Map<string, Modal> = new Map();


	registerModal(name: string, modal: Modal, autoRemove: boolean = true, open: boolean = true) {
		if (autoRemove) {
			modal.addEventListener("modal-closed", () => {
				this.closeAndDeleteModal(name);
			});
		}

		modal.container = this.context.host.renderRoot;

		// Close potentially opened modal of same type to prevent modal overlapping.
		this.closeModal(name);

		this.modals.set(name, modal);

		if (open) {
			modal.open();
		}
	}

	openModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.open();
		}
	}

	closeModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.close();
		}
	}

	closeAndDeleteModal(name: string) {
		const modal = this.modals.get(name);

		if (modal) {
			modal.close();

			this.modals.delete(name);
		}
	}

	closeAllModals() {
		this.modals.forEach((modal: Modal) => {
			modal.close();
		});
		this.modals.clear();
	}

	hasModalRegistered(name: string) {
		return this.modals.has(name);
	}
}