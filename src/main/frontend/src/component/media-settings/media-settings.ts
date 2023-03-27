import { html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { mediaSettingsStyles } from './media-settings.styles';
import { Utils } from '../../utils/utils';
import { setCameraBlocked, setMicrophoneBlocked } from '../../model/device-settings-store';

export abstract class MediaSettings extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		mediaSettingsStyles
	];

	@property({ type: Boolean, reflect: true })
	enabled: boolean = false;

	@property({ type: Boolean, reflect: true })
	error: boolean = false;

	@property()
	devicesBlocked: boolean;


	protected abstract updateModel(result: DeviceInfo, cameraBlocked: boolean): void;

	protected override firstUpdated() {
		this.setEnabled(false);
	}

	protected setEnabled(enabled: boolean) {
		this.enabled = enabled;

		// Initially, disable all inputs.
		this.renderRoot.querySelectorAll("button, input, select").forEach((element: HTMLInputElement) => {
			element.disabled = !enabled;
		});
	}

	protected setError() {
		this.error = true;

		// Enable only buttons in the footer.
		this.renderRoot.querySelectorAll("footer button").forEach((element: HTMLInputElement) => {
			element.disabled = false;
		});
	}

	protected renderDevices(devices: MediaDeviceInfo[], onChange: (event: Event) => void, name: string, id: string, label: string) {
		// Speaker feature is behind the 'media.setsinkid.enabled' preferences (needs to be set to true).
		// To change preferences in Firefox, visit about:config.
		if (name === "speakerDeviceId" && Utils.isFirefox()) {
			return null;
		}

		return html`
			<sl-select @sl-change="${onChange}" name="${name}" label="${label}" id="${id}" size="small" hoist>
				${this.renderDeviceOptions(devices)}
			</sl-select>
		`;
	}

	protected renderDeviceOptions(devices: MediaDeviceInfo[]) {
		const options: TemplateResult[] = [];

		devices.forEach(device =>
			options.push(html`<sl-option value="${device.deviceId}">${Devices.removeHwId(device.label)}</sl-option>`)
		);

		return options;
	}

	protected enumerateDevices(useVideo: boolean) {
		Devices.enumerateDevices(useVideo, true)
			.then((result: DeviceInfo) => {
				this.updateSettings(false, false);
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				if (error.name == "NotReadableError") {
					Devices.enumerateDevices(false, true)
						.then((result: DeviceInfo) => {
							this.updateSettings(false, true);
							this.updateModel(result, true);
						})
						.catch(error => {
							console.error(error);
						});
				}
				else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
					this.devicesBlocked = true;
					this.updateSettings(false, true);
					this.setError();
				}
				else {
					Devices.enumerateDevices(false, false)
						.then((result: DeviceInfo) => {
							this.updateSettings(false, true);
							this.updateModel(result, false);
						})
						.catch(error => {
							console.error(error);
						});
				}
			});
	}

	private updateSettings(micBlocked: boolean, camBlocked: boolean) {
		setMicrophoneBlocked(micBlocked);
		setCameraBlocked(camBlocked);
	}
}