import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { toastStyles, toastContainerStyles } from './toast.styles';

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

@customElement('player-toast-container')
export class ToastContainer extends I18nLitElement {

	static styles = [
		toastContainerStyles,
	];

	@property({ reflect: true })
	position: ToastPosition;

	@property({ reflect: true })
	gravity: ToastGravity;


	constructor() {
		super();
	}

	protected render() {
		return html`
			<slot></slot>
		`;
	}
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

	protected render() {
		return html`
			<div>
				${this.message}
			</div>

			${this.closeable ? html`
			<button type="button" class="icon-close close-button" aria-label="Close" @click="${this.close}"></button>
			` : ''}
		`;
	}
}
