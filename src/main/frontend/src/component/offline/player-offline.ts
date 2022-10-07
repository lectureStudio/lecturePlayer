import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerOfflineStyles } from './player-offline.styles';

@customElement('player-offline')
export class PlayerOffline extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerOfflineStyles,
	];

	@property({ type: String })
	description: string;


	protected render() {
		return html`
			<div>
				<span class="icon-unavailable"></span>
				<strong class="text-muted py-2">${t("course.unavailable")}</strong>
				<hr>
				<small>
					${unsafeHTML(this.description)}
				</small>
			</div>
		`;
	}
}