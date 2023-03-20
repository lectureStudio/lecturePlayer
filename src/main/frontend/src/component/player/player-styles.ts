import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';

@customElement('lecture-player-styles')
export class LecturePlayerStyles extends I18nLitElement {

	protected createRenderRoot() {
		return this;
	}

	protected render() {
		return html`
			<style>
				html {
					scroll-behavior: smooth;
				}

				.sl-toast-stack {
					left: 50%;
					transform: translateX(-50%);
				}
			</style>
		`;
	}
}