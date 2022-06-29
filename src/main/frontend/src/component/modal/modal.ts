import { property } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { modalStyles } from "./modal.styles";

export abstract class Modal extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		modalStyles
	];

	@property({ type: Boolean, reflect: true })
	show: boolean = true;


	open() {
		if (!document.body.contains(this)) {
			document.body.appendChild(this);
		}

		this.show = true;
	}

	close() {
		if (document.body.contains(this)) {
			document.body.removeChild(this);
		}

		this.show = false;
	}

	closing(event: Event) {
		event.preventDefault();

		this.dispatchEvent(Utils.createEvent("modal-closing"));
	}

	closed() {
		this.dispatchEvent(Utils.createEvent("modal-closed"));
	}

	opened() {
		this.dispatchEvent(Utils.createEvent("modal-opened"));
	}
}