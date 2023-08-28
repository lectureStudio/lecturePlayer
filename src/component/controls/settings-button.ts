import { html } from 'lit';
import { t } from '../i18n-mixin';
import { customElement, query } from 'lit/decorators.js';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { Component } from '../component';
import { EventEmitter } from '../../utils/event-emitter';
import { uiStateStore } from '../../store/ui-state.store';
import settingsButtonStyles from './settings-button.scss';

@customElement('settings-button')
export class SettingsButton extends Component {

	static styles = [
		settingsButtonStyles
	];

	readonly eventEmitter: EventEmitter;

	@query('sl-menu')
	menu: SlMenu;

	@query('sl-tooltip')
	tooltip: SlTooltip;

	@query('#camera-feed')
	cameraFeed: SlMenuItem;

	selectedDocId: string;


	protected firstUpdated(): void {
		this.cameraFeed.checked = uiStateStore.receiveCameraFeed;
	}

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
					<sl-menu-item type="checkbox" @click="${this.onReceiveCameraFeed}" id="camera-feed">
						${t("controls.receive.camera")}
						<sl-icon slot="prefix" name="camera-video"></sl-icon>
					</sl-menu-item>
					<sl-divider></sl-divider>
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
		this.eventEmitter.dispatchEvent(Utils.createEvent("player-statistics"));
	}

	private onDeviceSettings() {
		this.eventEmitter.dispatchEvent(Utils.createEvent("player-settings"));
	}

	private onReceiveCameraFeed() {
		this.eventEmitter.dispatchEvent(Utils.createEvent("stream-receive-camera-feed"));
	}

	private onItemSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;

		for (let item of this.menu.getAllItems()) {
			item.checked = false;
		}

		selectedItem.checked = uiStateStore.receiveCameraFeed;
	}
}