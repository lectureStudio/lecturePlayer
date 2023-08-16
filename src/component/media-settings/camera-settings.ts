import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { SlSelect } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';
import { deviceStore } from '../../store/device.store';
import { courseStore } from '../../store/course.store';
import cameraSettingsStyles from './camera-settings.scss';

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


	override disconnectedCallback() {
		Devices.stopVideoTracks(<MediaStream> this.video.srcObject);

		this.video.srcObject = null;

		super.disconnectedCallback();
	}

	queryDevices(): void {
		this.enumerateDevices();
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.cameraSelect) {
			this.cameraSelect.value = deviceStore.cameraDeviceId;
		}
	}

	protected override updateModel(result: DeviceInfo, cameraBlocked: boolean) {
		const devices = result.devices;

		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		this.videoInputDevices = devices.filter(device => device.kind === "videoinput");
		this.videoInputBlocked = cameraBlocked;

		this.video.srcObject = result.stream;
		this.video.muted = true;

		if (!this.videoInputDevices.find(devInfo => { return devInfo.deviceId === deviceStore.cameraDeviceId })) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);
		}

		this.setEnabled(true);
	}

	private enumerateDevices() {
		Devices.enumerateVideoDevices(true)
			.then((result: DeviceInfo) => {
				this.updateBlockedSettings(result);
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				this.devicesBlocked = true;
				this.setError();
			});
	}

	private updateBlockedSettings(info: DeviceInfo) {
		deviceStore.cameraBlocked = info ? info.stream.getVideoTracks().length < 1 : true;
	}

	private onCameraChange(event: Event) {
		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		const videoSource = (<HTMLInputElement> event.target).value;
		const videoConstraints: any = {};

		deviceStore.cameraDeviceId = videoSource;

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

			<form id="device-select-form">
				${when(courseStore.conference, () => html`
				<sl-switch id="cameraMuteOnEntry" name="cameraMuteOnEntry" size="small" ?checked=${deviceStore.cameraMuteOnEntry}>${t("devices.camera.mute.on.entry")}</sl-switch>
				`)}

				<div class="container2">
					<video id="cameraPreview" class="video" playsinline autoplay muted></video>
					<div class="controls">
						${this.renderDevices(this.videoInputDevices, this.onCameraChange, "cameraDeviceId", "cameraSelect", t("devices.camera"))}
					</div>
				</div>
			</form>
		`;
	}
}