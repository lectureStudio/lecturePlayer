import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
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

	render() {
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

	render() {
		return html`
			<div>
				${this.message}
			</div>

			${this.closeable ? html`
			<button type="button" class="close-button" aria-label="Close" @click="${this.close}">
				<svg viewBox="0 0 24 24" fill="none">
					<path d="M6.2253 4.81108C5.83477 4.42056 5.20161 4.42056 4.81108 4.81108C4.42056 5.20161 4.42056 5.83477 4.81108 6.2253L10.5858 12L4.81114 17.7747C4.42062 18.1652 4.42062 18.7984 4.81114 19.1889C5.20167 19.5794 5.83483 19.5794 6.22535 19.1889L12 13.4142L17.7747 19.1889C18.1652 19.5794 18.7984 19.5794 19.1889 19.1889C19.5794 18.7984 19.5794 18.1652 19.1889 17.7747L13.4142 12L19.189 6.2253C19.5795 5.83477 19.5795 5.20161 19.189 4.81108C18.7985 4.42056 18.1653 4.42056 17.7748 4.81108L12 10.5858L6.2253 4.81108Z" fill="currentColor" />
				</svg>
			</button>
			` : ''}
		`;
	}
}
