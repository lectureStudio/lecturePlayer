import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { Modal } from '../modal/modal';
import { Utils } from '../../utils/utils';
import { settingsModalStyles } from './settings.modal.styles';
import { Settings } from '../../utils/settings';
import { JanusService } from '../../service/janus.service';
import { SoundSettings } from '../sound-settings/sound-settings';
import { CameraSettings } from '../camera-settings/camera-settings';

@customElement("settings-modal")
export class SettingsModal extends Modal {

	static styles = [
		Modal.styles,
		settingsModalStyles
	];

	janusService: JanusService;

	@query('camera-settings')
	cameraSettings: CameraSettings;

	@query('sound-settings')
	soundSettings: SoundSettings;


	save() {
		const devices = { ...this.cameraSettings.getDeviceSettings(), ...this.soundSettings.getDeviceSettings() };

		Settings.saveDeviceChoice(devices);

		this.dispatchEvent(Utils.createEvent("device-settings-saved"));
		this.close();
	}

	cancel() {
		this.dispatchEvent(Utils.createEvent("device-settings-canceled"));
		this.close();
	}

	protected override render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("settings.title")}</span>
				</header>
				<article>
					<player-tabs>
						<p slot="tab">${t("settings.audio")}</p>
						<p slot="panel"><sound-settings></sound-settings></p>

						<p slot="tab">${t("settings.camera")}</p>
						<p slot="panel"><camera-settings></camera-settings></p>

						<p slot="tab">${t("settings.stats")}</p>
						<p slot="panel"><stream-stats .janusService="${this.janusService}"></stream-stats></p>
					</player-tabs>
				</article>
				<footer>
					<button type="button" @click="${this.cancel}" class="btn btn-outline-secondary btn-sm">${t("settings.close")}</button>
					<button type="button" @click="${this.save}" class="btn btn-outline-primary btn-sm" id="save-button">${t("settings.save")}</button>
				</footer>
			</web-dialog>
		`;
	}
}