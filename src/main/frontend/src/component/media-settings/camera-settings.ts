import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { DeviceSettings, Settings } from '../../utils/settings';
import { cameraSettingsStyles } from './camera-settings.styles';
import { SlSelect } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';

@customElement("camera-settings")
export class CameraSettings extends MediaSettings {

	static styles = [
		MediaSettings.styles,
		cameraSettingsStyles
	];

	@property()
	videoInputDevices: MediaDeviceInfo[] = [];

	@property()
	videoInputBlocked: boolean;

	@query('#cameraPreview')
	video: HTMLVideoElement;

	@query('#cameraSelect')
	cameraSelect: SlSelect;


	getDeviceSettings(): DeviceSettings {
		const deviceForm: HTMLFormElement = this.renderRoot?.querySelector('#deviceSelectForm') ?? null;
		const data = new FormData(deviceForm);

		return <DeviceSettings> <unknown> Object.fromEntries(data.entries());
	}

	override connectedCallback() {
		super.connectedCallback();

		this.enumerateDevices(true);
	}

	override disconnectedCallback() {
		Devices.stopMediaTracks(<MediaStream> this.video.srcObject);

		this.video.srcObject = null;

		super.disconnectedCallback();
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.cameraSelect) {
			this.cameraSelect.value = Settings.getCameraId();
		}
	}

	protected override updateModel(result: DeviceInfo, cameraBlocked: boolean) {
		const devices = result.devices;

		this.videoInputDevices = devices.filter(device => device.kind === "videoinput");
		this.videoInputBlocked = cameraBlocked;

		this.video.srcObject = result.stream;
		this.video.muted = true;

		if (!this.videoInputDevices.find(devInfo => { return devInfo.deviceId === Settings.getCameraId() })) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);
		}

		this.setEnabled(true);
	}

	private onCameraChange(event: Event) {
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
			width: { ideal: 1280 },
			height: { ideal: 720 },
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

	protected override render() {
		return html`
			<player-loading .text="${t("devices.querying")}"></player-loading>

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.permission")}</strong>
			</sl-alert>
			<sl-alert variant="warning" .open="${this.videoInputBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.camera.blocked")}</strong>
			</sl-alert>

			<form id="deviceSelectForm">
				<div class="container2">
					<video id="cameraPreview" class="video" playsinline autoplay muted></video>
					<div class="controls">
						${this.renderDevices(this.videoInputDevices, this.onCameraChange, "videoInput", "cameraSelect", t("devices.camera"))}
					</div>
				</div>
			</form>
		`;
	}
}