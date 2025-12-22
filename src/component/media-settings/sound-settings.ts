import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { SlSelect } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';
import { deviceStore } from '../../store/device.store';
import { courseStore } from '../../store/course.store';

@customElement("sound-settings")
export class SoundSettings extends MediaSettings {

	@property({ attribute: false })
	accessor audioInputDevices: MediaDeviceInfo[] = [];

	@property({ attribute: false })
	accessor audioOutputDevices: MediaDeviceInfo[] = [];

	@query('#audio')
	accessor audio: HTMLAudioElement;

	@query('#microphoneSelect')
	accessor microphoneSelect: SlSelect;

	@query('#speakerSelect')
	accessor speakerSelect: SlSelect;

	@query('#meter')
	accessor meterCanvas: HTMLCanvasElement;


	override disconnectedCallback() {
		if (this.audio) {
			Devices.stopMediaTracks(<MediaStream> this.audio.srcObject);

			this.audio.srcObject = null;
		}

		super.disconnectedCallback();
	}

	queryDevices(): void {
		if (this.initialized) {
			return;
		}

		Devices.enumerateAudioDevices(true)
			.then((result: DeviceInfo) => {
				this.error = false;

				this.updateBlockedSettings(result);
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				this.setDeviceError(error, true);
			})
			.finally(() => {
				this.initialized = true;
			});
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.microphoneSelect) {
			this.microphoneSelect.value = deviceStore.microphoneDeviceId;
		}
		if (this.speakerSelect) {
			this.speakerSelect.value = deviceStore.speakerDeviceId;
		}
	}

	protected override updateModel(result: DeviceInfo, _cameraBlocked: boolean) {
		const devices = result.devices;
		const stream = result.stream;

		Devices.stopMediaTracks(<MediaStream> this.audio.srcObject);

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");

		// Set default microphone if not already set.
		if (!deviceStore.microphoneDeviceId && this.audioInputDevices.length > 0) {
			const defaultMic = Devices.getDefaultDevice(this.audioInputDevices);
			if (defaultMic) {
				deviceStore.microphoneDeviceId = defaultMic.deviceId;
			}
		}

		// Set default speaker if not already set.
		if (!deviceStore.speakerDeviceId && deviceStore.canSelectSpeaker && this.audioOutputDevices.length > 0) {
			const defaultSpeaker = Devices.getDefaultDevice(this.audioOutputDevices);
			if (defaultSpeaker) {
				deviceStore.speakerDeviceId = defaultSpeaker.deviceId;
			}
		}

		this.audio.srcObject = result.stream || null;
		this.audio.muted = true;

		if (stream) {
			const audioTrack = stream.getAudioTracks()[0];

			Devices.getAudioLevel(audioTrack, this.meterCanvas);
		}

		this.setEnabled(true);
	}

	private updateBlockedSettings(info: DeviceInfo) {
		deviceStore.microphoneBlocked = info && info.stream ? info.stream.getAudioTracks().length < 1 : true;
	}

	private onMicrophoneChange(event: Event) {
		Devices.stopAudioTracks(this.audio.srcObject as MediaStream);

		const audioSource = (<HTMLInputElement> event.target).value;
		const audioConstraints = {
			audio: {
				deviceId: audioSource ? { exact: audioSource } : undefined
			}
		};

		deviceStore.microphoneDeviceId = audioSource;

		navigator.mediaDevices.getUserMedia(audioConstraints)
			.then(audioStream => {
				audioStream.getAudioTracks().forEach(track => (<MediaStream> this.audio.srcObject).addTrack(track));

				Devices.getAudioLevel(audioStream.getAudioTracks()[0], this.meterCanvas);
			})
			.catch(error => {
				console.error(error);

				this.setDeviceError(error, false);
			});
	}

	private onSpeakerChange(event: Event) {
		const audioSink = (<HTMLInputElement> event.target).value;

		deviceStore.speakerDeviceId = audioSink;

		Devices.setAudioSink(this.audio, audioSink);
	}

	protected override render() {
		return html`
			<player-loading .text="${t("devices.querying")}"></player-loading>

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.permission")}</strong>
			</sl-alert>

			${when(!this.error, () => html`
				<form id="device-select-form">
					${when(courseStore.conference, () => html`
						<sl-switch id="microphoneMuteOnEntry" name="microphoneMuteOnEntry" size="small" ?checked=${deviceStore.microphoneMuteOnEntry}>${t("devices.microphone.mute.on.entry")}</sl-switch>
					`)}

					${this.renderDevices(this.audioInputDevices, this.onMicrophoneChange, "microphoneDeviceId", "microphoneSelect", t("devices.microphone"))}

					${when(deviceStore.canSelectSpeaker, () => html`
						${this.renderDevices(this.audioOutputDevices, this.onSpeakerChange, "speakerDeviceId", "speakerSelect", t("devices.speaker"))}
					`)}
				</form>

				<audio id="audio" playsinline autoplay muted></audio>
				<canvas id="meter" width="300" height="5"></canvas>
			`)}
		`;
	}
}
