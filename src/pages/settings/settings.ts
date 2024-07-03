import { t } from "i18next";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Component } from "../../component/component";
import { I18nLitElement } from "../../component/i18n-mixin";
import styles from './settings.css';

@customElement('app-settings')
export class Settings extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];


	protected override render() {
		return html`
			<sl-tab-group placement="start">
				<sl-tab slot="nav" panel="ui">
					<div class="tab-container">
						<sl-icon name="layout"></sl-icon>
						<span>${t("settings.ui")}</span>
						<span class="help-text">${t("settings.ui.description")}</span>
					</div>
				</sl-tab>
				<sl-tab slot="nav" panel="api">
					<div class="tab-container">
						<sl-icon name="key"></sl-icon>
						<span>${t("settings.api")}</span>
						<span class="help-text">${t("settings.api.description")}</span>
					</div>
				</sl-tab>
				<sl-tab slot="nav" panel="audio">
					<div class="tab-container">
						<sl-icon name="sound"></sl-icon>
						<span>${t("settings.audio")}</span>
						<span class="help-text">${t("settings.audio.description")}</span>
					</div>
				</sl-tab>
				<sl-tab slot="nav" panel="video">
					<div class="tab-container">
						<sl-icon name="webcam"></sl-icon>
						<span>${t("settings.video")}</span>
						<span class="help-text">${t("settings.video.description")}</span>
					</div>
				</sl-tab>

				<sl-tab-panel name="ui">
					<ui-settings></ui-settings>
				</sl-tab-panel>
				<sl-tab-panel name="api">
					<api-settings></api-settings>
				</sl-tab-panel>
				<sl-tab-panel name="audio">
					<audio-settings></audio-settings>
				</sl-tab-panel>
				<sl-tab-panel name="video">
					This is the custom tab panel.
				</sl-tab-panel>
			</sl-tab-group>
		`;
	}
}
