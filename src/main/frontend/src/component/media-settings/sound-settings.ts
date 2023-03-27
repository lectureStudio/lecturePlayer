import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { SlSelect, SlSwitch } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';
import $deviceSettingsStore, { DeviceSettings } from '../../model/device-settings-store';

@customElement("sound-settings")
export class SoundSettings extends MediaSettings {

	@property()
	audioInputDevices: MediaDeviceInfo[] = [];

	@property()
	audioOutputDevices: MediaDeviceInfo[] = [];

	@query('#audio')
	audio: HTMLAudioElement;

	@query('#microphoneMuteOnEntry')
	microphoneMuteSwitch: SlSwitch;

	@query('#microphoneSelect')
	microphoneSelect: SlSelect;

	@query('#speakerSelect')
	speakerSelect: SlSelect;

	@query('#meter')
	meterCanvas: HTMLCanvasElement;


	getDeviceSettings(): DeviceSettings {
		const deviceForm: HTMLFormElement = this.renderRoot?.querySelector('#device-select-form') ?? null;
		const data = new FormData(deviceForm);

		const settings = <DeviceSettings><unknown> Object.fromEntries(data.entries());
		settings.microphoneMuteOnEntry = settings.microphoneMuteOnEntry ? true : false;

		return settings;
	}

	override connectedCallback() {
		super.connectedCallback();

		this.enumerateDevices(false);
	}

	override disconnectedCallback() {
		Devices.stopMediaTracks(<MediaStream> this.audio.srcObject);

		this.audio.srcObject = null;

		super.disconnectedCallback();
	}

	override firstUpdated() {
		super.firstUpdated();

		this.microphoneMuteSwitch.checked = $deviceSettingsStore.getState().microphoneMuteOnEntry;
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.microphoneSelect) {
			this.microphoneSelect.value = $deviceSettingsStore.getState().microphoneDeviceId;
		}
		if (this.speakerSelect) {
			this.speakerSelect.value = $deviceSettingsStore.getState().speakerDeviceId;
		}
	}

	protected override updateModel(result: DeviceInfo, cameraBlocked: boolean) {
		const devices = result.devices;

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");

		this.audio.srcObject = result.stream;
		this.audio.muted = true;

		const audioTrack = result.stream.getAudioTracks()[0];

		Devices.getAudioLevel(audioTrack, this.meterCanvas);

		this.setEnabled(true);
	}

	private onMicrophoneChange(event: Event) {
		Devices.stopAudioTracks(this.audio.srcObject as MediaStream);

		const audioSource = (<HTMLInputElement> event.target).value;
		const audioConstraints = {
			audio: {
				deviceId: audioSource ? { exact: audioSource } : undefined
			}
		};

		navigator.mediaDevices.getUserMedia(audioConstraints)
			.then(audioStream => {
				audioStream.getAudioTracks().forEach(track => (<MediaStream> this.audio.srcObject).addTrack(track));

				Devices.getAudioLevel(audioStream.getAudioTracks()[0], this.meterCanvas);
			})
			.catch(error => {
				console.error(error);

				if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
					this.devicesBlocked = true;
				}
			});
	}

	private onSpeakerChange(event: Event) {
		const audioSink = (<HTMLInputElement> event.target).value;

		Devices.setAudioSink(this.audio, audioSink);
	}

	protected override render() {
		return html`
			<player-loading .text="${t("devices.querying")}"></player-loading>

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.permission")}</strong>
			</sl-alert>

			<form id="device-select-form">
				<sl-switch id="microphoneMuteOnEntry" name="microphoneMuteOnEntry" size="small">${t("devices.microphone.mute.on.entry")}</sl-switch>
				${this.renderDevices(this.audioInputDevices, this.onMicrophoneChange, "microphoneDeviceId", "microphoneSelect", t("devices.microphone"))}
				${this.renderDevices(this.audioOutputDevices, this.onSpeakerChange, "speakerDeviceId", "speakerSelect", t("devices.speaker"))}
			</form>

			<audio id="audio" playsinline autoplay muted></audio>
			<canvas id="meter" width="300" height="5"></canvas>
		`;
	}
}