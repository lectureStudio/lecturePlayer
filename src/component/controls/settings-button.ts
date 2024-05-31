import { CSSResultGroup, html } from 'lit';
import { t } from '../i18n-mixin';
import { customElement, query } from 'lit/decorators.js';
import { SlMenu, SlMenuItem, SlTooltip } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { Component } from '../component';
import { EventEmitter } from '../../utils/event-emitter';
import { uiStateStore } from '../../store/ui-state.store';
import settingsButtonStyles from './settings-button.css';

@customElement('settings-button')
export class SettingsButton extends Component {

	static override styles = <CSSResultGroup>[
		settingsButtonStyles
	];

	readonly eventEmitter: EventEmitter;

	@query('sl-menu')
	accessor menu: SlMenu;

	@query('sl-tooltip')
	accessor tooltip: SlTooltip;

	@query('#camera-feed')
	accessor cameraFeed: SlMenuItem;

	selectedDocId: string;


	protected override updated(): void {
		this.cameraFeed.checked = uiStateStore.receiveCameraFeed;
	}

	protected override render() {
		return html`
			<sl-dropdown placement="top-start">
				<div slot="trigger">
					<sl-tooltip content="${t("controls.settings.more")}" trigger="hover">
						<sl-button @click="${this.onButton}">
							<sl-icon slot="prefix" name="more-vertical"></sl-icon>
						</sl-button>
					</sl-tooltip>
				</div>
				<sl-menu>
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
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-stream-statistics"));
	}

	private onDeviceSettings() {
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-settings"));
	}

	private onReceiveCameraFeed() {
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-receive-camera-feed"));
	}
}
