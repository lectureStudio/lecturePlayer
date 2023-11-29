import { CSSResultGroup, html, TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { Utils } from '../../utils/utils';
import { Component } from '../component';
import mediaSettingsStyles from './media-settings.css';

export abstract class MediaSettings extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		mediaSettingsStyles
	];

	protected initialized: boolean;

	@property({ type: Boolean, reflect: true })
	enabled: boolean = false;

	@property({ type: Boolean, reflect: true })
	error: boolean = false;

	@property()
	devicesBlocked: boolean;

	@property()
	inputBlocked: boolean;


	abstract queryDevices(): void;

	protected abstract updateModel(result: DeviceInfo, cameraBlocked: boolean): void;


	protected override firstUpdated() {
		this.setEnabled(false);

		this.initialized = false;

		// Initially, disable all inputs.
		this.renderRoot.querySelectorAll<HTMLInputElement>("button, input, select").forEach(element => {
			element.disabled = true;
		});
	}

	protected setEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	protected setError() {
		this.error = true;

		// Enable only buttons in the footer.
		this.renderRoot.querySelectorAll<HTMLInputElement>("footer button").forEach(element => {
			element.disabled = false;
		});
	}

	protected setDeviceError(error: Error, lock: boolean) {
		if (error.name == "NotReadableError") {
			this.inputBlocked = true;
		}
		else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
			this.devicesBlocked = true;
		}

		if (lock) {
			this.setError();
		}
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
}