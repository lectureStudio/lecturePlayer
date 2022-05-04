import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { toastStyles } from './toast.styles';

export enum ToastGravity {
	Top,
	Bottom
}

export enum ToastPosition {
	Left,
	Center,
	Right
}

export enum ToastType {
	Default,
	Success,
	Info,
	Warning,
	Error
}

@customElement('player-toast')
export class Toast extends I18nLitElement {

	static styles = [
		toastStyles,
	];

	@property()
	message: string;

	@property({ reflect: true })
	show: boolean;

	@property({ reflect: true })
	closeable: boolean;

	@property({ reflect: true })
	position: ToastPosition;

	@property({ reflect: true })
	gravity: ToastGravity;

	@property({ reflect: true })
	type: ToastType;

	timeOutValue: number;


	constructor(message: string) {
		super();

		this.message = message;
	}

	close() {
		const event = new CustomEvent("toast-close", {
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	render() {
		return html`
			<div>
				${this.message}
			</div>
			<button type="button" class="close-button" aria-label="Close" @click="${this.close}"></button>
		`;
	}
}
