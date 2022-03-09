import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerOfflineStyles } from './player-offline.styles';

@customElement('player-offline')
export class PlayerOffline extends I18nLitElement {

	static styles = [
		playerOfflineStyles,
	];

	render() {
		return html`
			<i class="h1 bi bi-calendar-x text-primary"></i>
			<strong class="text-muted py-2">${t("course.unavailable")}</strong>
		`;
	}

}