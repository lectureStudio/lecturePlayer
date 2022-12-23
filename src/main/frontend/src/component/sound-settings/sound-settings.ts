import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { DeviceSettings, Settings } from '../../utils/settings';
import { soundSettingsStyles } from './sound-settings.styles';

@customElement("sound-settings")
export class SoundSettings extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		soundSettingsStyles
	];

	@property()
	audioInputDevices: MediaDeviceInfo[] = [];

	@property()
	audioOutputDevices: MediaDeviceInfo[] = [];

	@property({ type: Boolean, reflect: true })
	enabled: boolean = false;

	@property({ type: Boolean, reflect: true })
	error: boolean = false;

	@property()
	devicesBlocked: boolean;

	@query('#audio')
	audio: HTMLAudioElement;

	@query('#meter')
	meterCanvas: HTMLCanvasElement;


	getDeviceSettings(): DeviceSettings {
		const deviceForm: HTMLFormElement = this.renderRoot?.querySelector('#deviceSelectForm') ?? null;
		const data = new FormData(deviceForm);

		return <DeviceSettings> <unknown> Object.fromEntries(data.entries());
	}

	override connectedCallback() {
		super.connectedCallback();

		Devices.enumerateDevices(true, true)
			.then((result: DeviceInfo) => {
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				if (error.name == "NotReadableError") {
					Devices.enumerateDevices(false, true)
						.then((result: DeviceInfo) => {
							this.updateModel(result, true);
						})
						.catch(error => {
							console.error(error);
						});
				}
				else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
					this.devicesBlocked = true;
					this.setError();
				}
				else {
					Devices.enumerateDevices(false, false)
						.then((result: DeviceInfo) => {
							this.updateModel(result, false);
						})
						.catch(error => {
							console.error(error);
						});
				}
			});
	}

	override disconnectedCallback() {
		Devices.stopMediaTracks(<MediaStream> this.audio.srcObject);

		this.audio.srcObject = null;

		super.disconnectedCallback();
	}

	protected override firstUpdated() {
		this.setEnabled(false);
	}

	private setEnabled(enabled: boolean) {
		this.enabled = enabled;

		// Initially, disable all inputs.
		this.renderRoot.querySelectorAll("button, input, select").forEach((element: HTMLInputElement) => {
			element.disabled = !enabled;
		});
	}

	private setError() {
		this.error = true;

		// Enable only buttons in the footer.
		this.renderRoot.querySelectorAll("footer button").forEach((element: HTMLInputElement) => {
			element.disabled = false;
		});
	}

	private updateModel(result: DeviceInfo, cameraBlocked: boolean) {
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

			<div class="row alert alert-warning m-2 ${classMap({ "d-none": !this.devicesBlocked })}" role="alert">
				<span>${t("devices.permission")}</span>
			</div>

			<form id="deviceSelectForm">
				<div class="row">
					<div class="col-md-8">
						<audio id="audio" playsinline autoplay muted></audio>

						<div class="mb-3">
							<label for="microphoneSelect" class="form-label">${t("devices.audio.input")}</label>
							<select @change="${this.onMicrophoneChange}" name="audioInput" id="microphoneSelect" class="form-select form-select-sm" aria-label=".form-select-sm microphone">
								${this.audioInputDevices.map((device) =>
									html`<option value="${device.deviceId}" ?selected="${Settings.getMicrophoneId() === device.deviceId}">${Devices.removeHwId(device.label)}</option>`
								)}
							</select>
						</div>
						<div class="mb-3 ${classMap({ "d-none": this.audioOutputDevices.length === 0 })}">
							<label for="speakerSelect" class="form-label">${t("devices.audio.output")}</label>
							<select @change="${this.onSpeakerChange}" name="audioOutput" id="speakerSelect" class="form-select form-select-sm" aria-label=".form-select-sm speaker">
								${this.audioOutputDevices.map((device) =>
									html`<option value="${device.deviceId}" ?selected="${Settings.getSpeakerId() === device.deviceId}">${Devices.removeHwId(device.label)}</option>`
								)}
							</select>
						</div>
					</div>
				</div>
				<div class="row">
					<canvas id="meter" width="300" height="5"></canvas>
				</div>
			</form>
		`;
	}
}