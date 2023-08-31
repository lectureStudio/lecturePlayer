import { html, TemplateResult } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { SlMenu, SlMenuItem } from '@shoelace-style/shoelace';
import { Utils } from '../../utils/utils';
import { Devices } from '../../utils/devices';
import mediaDeviceButtonStyles from './media-device-button.scss';

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

	@state()
	deviceSettings: DeviceSettings;

	@query('sl-menu')
	menu: SlMenu;

	@property({ type: Boolean, reflect: true })
	muted: boolean = false;

	selectedDevice: MediaDeviceInfo;


	override connectedCallback() {
		super.connectedCallback();

		$deviceSettingsStore.updates.watch(settings => {
			this.deviceSettings = settings;

			if (!settings.cameraBlocked || !settings.microphoneBlocked) {
				// Enumerate devices if unblocked.
				this.getDevices();
			}
		});

		this.deviceSettings = $deviceSettingsStore.getState();

		// When devices are (dis)connected.
		navigator.mediaDevices.ondevicechange = () => {
			this.getDevices();
		};

		// Initially fill device list.
		this.getDevices();
	}

	protected override firstUpdated(): void {
		// Register listeners.
		this.menu.addEventListener("sl-select", this.onItemSelected.bind(this));
		document.addEventListener("lect-device-permission-change", () => {
			// this.getDevices();
		});
	}

	protected render() {
		const itemTemplates: TemplateResult[] = [];
		let disabled = false;

		if (this.type == "audio") {
			disabled = this.deviceSettings.microphoneBlocked;

			const speakerItems = this.renderDeviceItems("audiooutput");
			const microphoneItems = this.renderDeviceItems("audioinput");

			if (speakerItems.length > 0) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.speaker")}</sl-menu-label>`);
				itemTemplates.push(...speakerItems);
			}
			if (microphoneItems.length > 0) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.microphone")}</sl-menu-label>`);
				itemTemplates.push(...microphoneItems);

				// This can happen with Firefox. Even if the permission was not granted,
				// the device names are visible when camera was granted.
				// So do not punish Firefox users.
				disabled = false;
			}
			else if (disabled) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.permission.required")}</sl-menu-label>`);
			}
		}
		else {
			disabled = this.deviceSettings.cameraBlocked;

			const cameraItems = this.renderDeviceItems("videoinput");

			if (cameraItems.length > 0) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.camera")}</sl-menu-label>`);
				itemTemplates.push(...cameraItems);

				// This can happen with Firefox. Even if the permission was not granted,
				// the device names are visible when microphone was granted.
				// So do not punish Firefox users.
				disabled = false;
			}
			else if (disabled) {
				itemTemplates.push(html`<sl-menu-label>${t("devices.permission.required")}</sl-menu-label>`);
			}
		}

		return html`
			<sl-tooltip content="${this.tooltip}" trigger="hover">
				<sl-button id="enable-button" @click="${this.onMute}" ?disabled="${disabled}">
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

		for (const item of this.menu.getAllItems()) {
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

		if (this.deviceSettings.cameraBlocked && this.deviceSettings.microphoneBlocked) {
			this.devices = devices;
			return;
		}

		const predicate = this.type == "audio"
			? (device: MediaDeviceInfo) => {
				return device.label && (device.kind === "audioinput" || device.kind === "audiooutput");
			}
			: (device: MediaDeviceInfo) => {
				return device.label && device.kind === "videoinput";
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
				return this.deviceSettings.microphoneDeviceId;
			case 'audiooutput':
				return this.deviceSettings.speakerDeviceId;
			case 'videoinput':
				return this.deviceSettings.cameraDeviceId;
			default:
				throw new Error("Kind of media device not supported");
		}
	}
}