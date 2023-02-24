import { property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { modalStyles } from "./modal.styles";
import { SlDialog } from "@shoelace-style/shoelace";

export abstract class Modal extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		modalStyles
	];

	@query('sl-dialog')
	dialog: SlDialog;

	container: HTMLElement | ShadowRoot = document.body;


	protected override firstUpdated(): void {
		// Defer showing dialog to enable animations.
		window.setTimeout(() => {
			this.dialog.addEventListener("sl-after-show", this.opened.bind(this));
			this.dialog.addEventListener("sl-after-hide", this.closed.bind(this));
			this.dialog.addEventListener("sl-request-close", this.requestClose.bind(this));
			this.dialog.show();
		});
	}

	open() {
		if (!this.container.contains(this)) {
			this.container.appendChild(this);
		}
	}

	close() {
		this.dialog.hide();
	}

	private requestClose(event: CustomEvent) {
		if (event.detail.source === "overlay") {
			event.preventDefault();
		}
	}

	private closed(event: Event) {
		// Events may come from other components, like sl-dropdown.
		if (event.target !== this.dialog) {
			event.preventDefault();
			return;
		}

		if (this.container.contains(this)) {
			this.container.removeChild(this);
		}

		this.dispatchEvent(Utils.createEvent("modal-closed"));
	}

	private opened() {
		this.dispatchEvent(Utils.createEvent("modal-opened"));
	}
}