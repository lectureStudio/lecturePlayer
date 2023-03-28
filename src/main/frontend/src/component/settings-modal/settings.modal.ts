import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { Utils } from '../../utils/utils';
import { settingsModalStyles } from './settings.modal.styles';
import { JanusService } from '../../service/janus.service';
import { SoundSettings } from '../media-settings/sound-settings';
import { CameraSettings } from '../media-settings/camera-settings';
import { LayoutSettings } from '../media-settings/layout-settings'
import { SlTab } from '@shoelace-style/shoelace';
import { persistDeviceSettings, setDeviceSettings } from '../../model/device-settings-store';
import $presentationStore, { ContentLayout } from "../../model/presentation-store";

@customElement("settings-modal")
export class SettingsModal extends Modal {

	static styles = [
		Modal.styles,
		settingsModalStyles
	];

	janusService: JanusService;

	@property()
	section: string = "audio";

	@query('camera-settings')
	cameraSettings: CameraSettings;

	@query('sound-settings')
	soundSettings: SoundSettings;

	@query('layout-settings')
	layoutSettings: LayoutSettings;

	save() {
		const devices = { ...this.cameraSettings.getDeviceSettings(), ...this.soundSettings.getDeviceSettings() };

		setDeviceSettings(devices);
		persistDeviceSettings(devices);

		this.dispatchEvent(Utils.createEvent("device-settings-saved"));
		this.close();
	}

	cancel() {
		this.dispatchEvent(Utils.createEvent("device-settings-canceled"));
		this.close();
	}

	protected override firstUpdated(): void {
		super.firstUpdated();

		// Select and show the desired settings content/section.
		if (this.section) {
			const tab: SlTab = this.shadowRoot.querySelector(`sl-tab[panel=${this.section}]`);
			const tabPanel: SlTab = this.shadowRoot.querySelector(`sl-tab-panel[name=${this.section}]`);

			if (tab && tabPanel) {
				tab.active = true;
				tabPanel.active = true;
			}
		}
	}

	protected override render() {
		const layoutChangeEnabled = $presentationStore.getState().contentLayout !== ContentLayout.Gallery;

		return html`
			<sl-dialog label="${t("settings.title")}">
				<sl-tab-group>
					<sl-tab slot="nav" panel="audio">${t("settings.audio")}</sl-tab>
					<sl-tab slot="nav" panel="video">${t("settings.camera")}</sl-tab>
					<sl-tab slot="nav" .disabled="${!layoutChangeEnabled}" panel="layout">${t("settings.layout")}</sl-tab>

					<sl-tab-panel name="audio">
						<sound-settings></sound-settings>
					</sl-tab-panel>
					<sl-tab-panel name="video">
						<camera-settings></camera-settings>
					</sl-tab-panel>
					<sl-tab-panel name="layout">
						<layout-settings></layout-settings>
					</sl-tab-panel>
				</sl-tab-group>
				<div slot="footer">
					<sl-button @click="${this.cancel}" variant="default" size="small">${t("settings.close")}</sl-button>
					<sl-button @click="${this.save}" variant="primary" size="small" id="save-button">${t("settings.save")}</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}