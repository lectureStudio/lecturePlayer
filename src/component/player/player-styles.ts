import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';

@customElement('lecture-player-styles')
export class LecturePlayerStyles extends I18nLitElement {

	protected override createRenderRoot() {
		return this;
	}

	protected override render() {
		return html`
			<style>
				html {
					scroll-behavior: smooth;
				}

				/* Global scroll lock for pseudo fullscreen */
				html.lp-scroll-lock, body.lp-scroll-lock {
					overflow: hidden !important;
					height: 100% !important;
				}

				.sl-toast-stack {
					position: fixed;
					left: 50%;
					transform: translateX(-50%);
				}

				.hiddenCanvasElement {
					position: absolute;
					top: 0;
					left: 0;
					width: 0;
					height: 0;
					display: none;
				}
			</style>
		`;
	}
}
