import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { settingsModalStyles } from './settings-modal.styles';

@customElement('settings-modal')
export class SettingsModal extends I18nLitElement {

	static styles = [
		settingsModalStyles,
	];

	@property({ type: Boolean, reflect: true })
	show: boolean = false;


	render() {
		return html`
			<div class="lds-ellipsis">
				<div></div><div></div><div></div><div></div>
			</div>
			<span>${t("course.loading")}</span>
		`;
	}
}