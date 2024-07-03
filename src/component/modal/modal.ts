import { CSSResultGroup } from "lit";
import { query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { SlDialog } from "@shoelace-style/shoelace";
import styles from "./modal.css";

export abstract class Modal extends I18nLitElement {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles
	];

	@query('sl-dialog')
	accessor dialog: SlDialog;

	container: HTMLElement | DocumentFragment = document.body;


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
		if (this.dialog) {
			this.dialog.hide();
		}
	}

	private requestClose(event: CustomEvent) {
		if (event.detail.source === "overlay") {
			event.preventDefault();
		}
	}

	protected closed(event: Event) {
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

	protected opened() {
		this.dispatchEvent(Utils.createEvent("modal-opened"));
	}
}
