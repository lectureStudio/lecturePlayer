import { html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { mediaDeviceButtonStyles } from './media-device-button.styles';
import { SlMenu, SlMenuItem } from '@shoelace-style/shoelace';
import { Settings } from '../../utils/settings';
import { Utils } from '../../utils/utils';
import { Devices } from '../../utils/devices';

@customElement('media-device-button')
export class MediaDeviceButton extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		mediaDeviceButtonStyles,
	];

	@property({ type: String })
	type: "audio" | "video";

	@property({ type: String, reflect: false })
	tooltip: string;

	@state()
	devices: Map<string, MediaDeviceInfo> = new Map();

	@query('sl-menu')
	menu: SlMenu;

	@property({ type: Boolean, reflect: true })
	muted: boolean = false;

	selectedDevice: MediaDeviceInfo;


	override connectedCallback() {
		super.connectedCallback();

		// When devices are (dis)connected.
		navigator.mediaDevices.ondevicechange = () => {
			this.getDevices();
		};

		// Initially fill device list.
		this.getDevices();
	}

	protected override firstUpdated(): void {
		// Register listeners.
		this.menu.addEventListener('sl-select', this.onItemSelected.bind(this));
	}

	protected render() {
		const itemTemplates: TemplateResult[] = [];

		if (this.type == "audio") {
			const speakerItems = this.renderDeviceItems("audiooutput");
			const microphoneItems = this.renderDeviceItems("audioinput");

			if (speakerItems.length > 0) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.speaker")}</sl-menu-label>`);
				itemTemplates.push(...speakerItems);
			}
			if (microphoneItems.length > 0) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.microphone")}</sl-menu-label>`);
				itemTemplates.push(...microphoneItems);
			}
		}
		else {
			itemTemplates.push(html`<sl-menu-label>${t("devices.camera")}</sl-menu-label>`);
			itemTemplates.push(...this.renderDeviceItems("videoinput"));
		}

		return html`
			<sl-tooltip content="${this.tooltip}">
				<sl-button id="enable-button" @click="${this.onMute}">
					<slot slot="prefix" name="icon"></slot>
				</sl-button>
			</sl-tooltip>
			<sl-dropdown placement="top-start">
				<sl-button slot="trigger" caret>
					<sl-visually-hidden>Device options</sl-visually-hidden>
				</sl-button>
				<sl-menu>
					${itemTemplates}
					<sl-divider></sl-divider>
					<sl-menu-item @click="${this.onSettings}">${t("devices.settings")}</sl-menu-item>
				</sl-menu>
			</sl-dropdown>
		`;
	}

	private renderDeviceItems(kind: MediaDeviceKind) {
		const itemTemplates = [];

		for (const device of this.devices.values()) {
			if (device.kind === kind) {
				const selected = this.getSettingsDeviceId(device) === device.deviceId;

				if (selected && device.kind !== "audiooutput") {
					this.selectedDevice = device;
				}

				itemTemplates.push(html`
					<sl-menu-item type="checkbox"
						value="${device.deviceId}"
						?checked="${selected}"
					>
						${Devices.removeHwId(device.label)}
					</sl-menu-item>
				`);
			}
		}

		return itemTemplates;
	}

	private onItemSelected(event: CustomEvent) {
		const selectedItem: SlMenuItem = event.detail.item;
		const device: MediaDeviceInfo = this.devices.get(selectedItem.value);

		// Handle only items related to a device, e.g. not the settings item.
		if (!device) {
			return;
		}

		// Keep selected item checked, e.g. when double-checked.
		selectedItem.checked = true;

		if (this.selectedDevice?.deviceId === selectedItem.value) {
			// Same item selected.
			return;
		}

		for (let item of this.menu.getAllItems()) {
			// Uncheck all items, except the selected one.
			const dev: MediaDeviceInfo = this.devices.get(item.value);

			if (dev && item.value !== selectedItem.value && device.kind === dev.kind) {
				item.checked = false;
			}
		}

		this.selectedDevice = device;

		this.dispatchEvent(Utils.createEvent<MediaDeviceSetting>("lect-device-change", {
			deviceId: device.deviceId,
			kind: device.kind,
			muted: this.muted
		}));
	}

	private onMute() {
		if (this.selectedDevice && this.selectedDevice.kind === "audiooutput") {
			// Mute only input devices.
			return;
		}

		this.muted = !this.muted;

		this.dispatchEvent(Utils.createEvent<MediaDeviceSetting>("lect-device-mute", {
			deviceId: this.selectedDevice.deviceId,
			kind: this.selectedDevice.kind,
			muted: this.muted
		}));
	}

	private onSettings() {
		this.dispatchEvent(Utils.createEvent("lect-device-settings", {
			type: this.type
		}));
	}

	private getDevices() {
		const devices: Map<string, MediaDeviceInfo> = new Map();

		const predicate = this.type == "audio"
			? (device: MediaDeviceInfo) => {
				return device.kind === "audioinput" || device.kind === "audiooutput";
			}
			: (device: MediaDeviceInfo) => {
				return device.kind === "videoinput";
			};

		navigator.mediaDevices.enumerateDevices()
			.then((deviceInfo: MediaDeviceInfo[]) => {
				deviceInfo.forEach((device: MediaDeviceInfo) => {
					if (predicate(device)) {
						devices.set(device.deviceId, device);
					}
				});

				// This will update device menu.
				this.devices = devices;
			})
			.catch((err) => {
				// TODO: Show error to user.
				console.error(`${err.name}: ${err.message}`);
			});
	}

	private getSettingsDeviceId(device: MediaDeviceInfo): string {
		switch (device.kind) {
			case 'audioinput':
				return Settings.getMicrophoneId();
			case 'audiooutput':
				return Settings.getSpeakerId();
			case 'videoinput':
				return Settings.getCameraId();
			default:
				throw new Error("Kind of media device not supported");
		}
	}
}