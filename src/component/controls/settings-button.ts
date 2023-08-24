import { html } from 'lit';
import { t } from '../i18n-mixin';
import { customElement, query } from 'lit/decorators.js';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { Component } from '../component';
import settingsButtonStyles from './settings-button.scss';

@customElement('settings-button')
export class SettingsButton extends Component {

	static styles = [
		settingsButtonStyles
	];

	@query('sl-menu')
	menu: SlMenu;

	@query('sl-tooltip')
	tooltip: SlTooltip;

	selectedDocId: string;


	protected render() {
		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.settings.more")}" trigger="hover">
						<sl-button @click="${this.onButton}">
							<sl-icon slot="prefix" name="more-vertical"></sl-icon>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu @sl-select="${this.onItemSelected}">
					<sl-menu-item @click="${this.onStatistics}">
						${t("settings.stats")}
						<sl-icon slot="prefix" name="stats"></sl-icon>
					</sl-menu-item>
					<sl-menu-item @click="${this.onDeviceSettings}">
						${t("controls.settings")}
						<sl-icon slot="prefix" name="settings"></sl-icon>
					</sl-menu-item>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private onButton() {
		this.tooltip.hide();
	}

	private onStatistics() {
		this.dispatchEvent(Utils.createEvent("player-statistics"));
	}

	private onDeviceSettings() {
		this.dispatchEvent(Utils.createEvent("player-settings"));
	}

	private onItemSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const docId = selectedItem.value;

		if (!docId) {
			// Document control item selected.
			return;
		}

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		if (this.selectedDocId === docId) {
			// Same item selected.
			return;
		}

		for (let item of this.menu.getAllItems()) {
			// Uncheck all items, except the selected one.
			if (item.value !== docId) {
				item.checked = false;
			}
		}

		this.selectedDocId = docId;

		this.dispatchEvent(Utils.createEvent("lect-select-document", {
			documentId: docId
		}));
	}
}