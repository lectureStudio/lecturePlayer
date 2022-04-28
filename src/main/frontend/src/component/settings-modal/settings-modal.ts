import { html } from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { settingsModalStyles } from './settings-modal.styles';
import { DeviceInfo, Devices, DeviceSettings } from '../../utils/devices';
import "web-dialog/index";

@customElement("settings-modal")
export class SettingsModal extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		settingsModalStyles
	];

	@property({ type: Boolean, reflect: true })
	show: boolean = true;

	@property()
	audioInputDevices: MediaDeviceInfo[] = [];

	@property()
	audioOutputDevices: MediaDeviceInfo[] = [];

	@property()
	videoInputDevices: MediaDeviceInfo[] = [];

	@property()
	devicesBlocked: boolean;

	@property()
	videoInputBlocked: boolean;

	@query('#cameraPreview')
	video: HTMLVideoElement;

	@query('#meter')
	meterCanvas: HTMLCanvasElement;


	open() {
		document.body.appendChild(this);
	}

	close() {
		document.body.removeChild(this);

		this.show = false;
	}

	save() {
		const deviceForm: HTMLFormElement = this.renderRoot?.querySelector('#deviceSelectForm') ?? null;
		const data = new FormData(deviceForm);
		const devices = <DeviceSettings><unknown> Object.fromEntries(data.entries());

		Devices.saveDeviceChoice(devices);

		const event = new CustomEvent("device-settings-saved", {
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);

		this.close();
	}

	closed() {
		Devices.stopMediaTracks(<MediaStream> this.video.srcObject);

		this.video.srcObject = null;

		const event = new CustomEvent("device-settings-closed", {
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(event);
	}

	closing(event: Event) {
		event.preventDefault();
	}

	opened() {
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

	updateModel(result: DeviceInfo, cameraBlocked: boolean) {
		const devices = result.devices;

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");
		this.videoInputDevices = devices.filter(device => device.kind === "videoinput");
		this.videoInputBlocked = cameraBlocked;

		this.video.srcObject = result.stream;
		this.video.muted = true;

		if (!this.videoInputDevices.find(devInfo => { return devInfo.deviceId === Devices.getCameraId() })) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);
		}

		const audioTrack = result.stream.getAudioTracks()[0];

		Devices.getAudioLevel(audioTrack, this.meterCanvas);
	}

	onMicrophoneChange(event: Event) {
		Devices.stopAudioTracks(this.video.srcObject as MediaStream);

		const audioSource = (<HTMLInputElement> event.target).value;
		const audioConstraints = {
			audio: {
				deviceId: audioSource ? { exact: audioSource } : undefined
			}
		};

		navigator.mediaDevices.getUserMedia(audioConstraints)
			.then(audioStream => {
				audioStream.getAudioTracks().forEach(track => (<MediaStream> this.video.srcObject).addTrack(track));

				Devices.getAudioLevel(audioStream.getAudioTracks()[0], this.meterCanvas);
			})
			.catch(error => {
				console.error(error);

				if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
					this.devicesBlocked = true;
				}
			});
	}

	onSpeakerChange(event: Event) {
		const audioSink = (<HTMLInputElement> event.target).value;

		Devices.setAudioSink(this.video, audioSink);
	}

	onCameraChange(event: Event) {
		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		const videoSource = (<HTMLInputElement> event.target).value;
		const videoConstraints: any = {};

		if (videoSource === "none") {
			this.video.style.display = "none";
			this.videoInputBlocked = false;
			return;
		}

		videoConstraints.video = {
			deviceId: videoSource ? { exact: videoSource } : undefined,
			width: 1280,
			height: 720,
			facingMode: "user"
		};

		navigator.mediaDevices.getUserMedia(videoConstraints)
			.then(videoStream => {
				const newStream = new MediaStream();

				(<MediaStream> this.video.srcObject).getAudioTracks().forEach(track => newStream.addTrack(track));
				videoStream.getVideoTracks().forEach(track => newStream.addTrack(track));

				this.video.srcObject = newStream;
				this.video.style.display = "block";

				this.videoInputBlocked = false;
			})
			.catch(error => {
				console.error(error);

				if (error.name == "NotReadableError") {
					this.videoInputBlocked = true;
				}
				else if (error.name == "NotAllowedError" || error.name == "PermissionDeniedError") {
					this.devicesBlocked = true;
				}
			});
	}

	render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("settings.title")}</span>
				</header>
				<article>
					<div class="row alert alert-warning m-2 ${classMap({ "d-none": !this.devicesBlocked })}" role="alert">
						<span>${t("devices.permission")}</span>
					</div>
					<div class="row alert alert-warning m-2 ${classMap({ "d-none": !this.videoInputBlocked })}" role="alert">
						<span>${t("devices.camera.blocked")}</span>
					</div>
					<form id="deviceSelectForm">
						<div class="row">
							<div class="col-md-4">
								<video id="cameraPreview" class="pt-2 ratio ratio-16x9" playsinline autoplay muted></video>
							</div>
							<div class="col-md-8">
								<div class="mb-3">
									<label for="cameraSelect" class="form-label">${t("devices.camera")}</label>
									<select @change="${this.onCameraChange}" name="videoInput" id="cameraSelect" class="form-select form-select-sm" aria-label=".form-select-sm camera">
										<option value="none">${t("devices.none")}</option>
										${this.videoInputDevices.map((device) =>
											html`<option value="${device.deviceId}" ?selected="${Devices.getCameraId() === device.deviceId}">${Devices.removeHwId(device.label)}</option>`
										)}
									</select>
								</div>
								<div class="mb-3">
									<label for="microphoneSelect" class="form-label">${t("devices.audio.input")}</label>
									<select @change="${this.onMicrophoneChange}" name="audioInput" id="microphoneSelect" class="form-select form-select-sm" aria-label=".form-select-sm microphone">
										${this.audioInputDevices.map((device) =>
											html`<option value="${device.deviceId}" ?selected="${Devices.getMicrophoneId() === device.deviceId}">${Devices.removeHwId(device.label)}</option>`
										)}
									</select>
								</div>
								<div class="mb-3 ${classMap({ "d-none": this.audioOutputDevices.length === 0 })}">
									<label for="speakerSelect" class="form-label">${t("devices.audio.output")}</label>
									<select @change="${this.onSpeakerChange}" name="audioOutput" id="speakerSelect" class="form-select form-select-sm" aria-label=".form-select-sm speaker">
										${this.audioOutputDevices.map((device) =>
											html`<option value="${device.deviceId}" ?selected="${Devices.getSpeakerId() === device.deviceId}">${Devices.removeHwId(device.label)}</option>`
										)}
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<canvas id="meter" width="300" height="5"></canvas>
						</div>
					</form>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">${t("settings.cancel")}</button>
					<button type="button" @click="${this.save}" class="btn btn-outline-primary btn-sm">${t("settings.save")}</button>
				</footer>
			</web-dialog>
		`;
	}
}