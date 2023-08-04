import { Component } from "../component";
import { property } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { modalStyles } from "./modal.styles";
import "web-dialog/index";

export abstract class Modal extends Component {

	static styles = [
		I18nLitElement.styles,
		modalStyles
	];

	@property({ type: Boolean, reflect: true })
	show: boolean = true;

	container: HTMLElement | ShadowRoot = document.body;


	open() {
		if (!this.container.contains(this)) {
			this.container.appendChild(this);
		}

		this.show = true;
	}

	close() {
		if (this.container.contains(this)) {
			this.container.removeChild(this);
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