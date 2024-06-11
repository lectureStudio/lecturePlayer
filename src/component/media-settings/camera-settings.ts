import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { t } from '../i18n-mixin';
import { DeviceInfo, Devices } from '../../utils/devices';
import { SlSelect } from '@shoelace-style/shoelace';
import { MediaSettings } from './media-settings';
import { deviceStore } from '../../store/device.store';
import { courseStore } from '../../store/course.store';
import cameraSettingsStyles from './camera-settings.css';

@customElement("camera-settings")
export class CameraSettings extends MediaSettings {

	static override styles = [
		MediaSettings.styles,
		cameraSettingsStyles
	];

	@property({ attribute: false })
	accessor videoInputDevices: MediaDeviceInfo[] = [];

	@query('#cameraPreview')
	accessor video: HTMLVideoElement;

	@query('#cameraSelect')
	accessor cameraSelect: SlSelect;


	override disconnectedCallback() {
		if (this.video) {
			Devices.stopVideoTracks(<MediaStream> this.video.srcObject);

			this.video.srcObject = null;
		}

		super.disconnectedCallback();
	}

	queryDevices(): void {
		if (this.initialized) {
			return;
		}

		Devices.enumerateVideoDevices()
			.then((result: DeviceInfo) => {
				this.error = false;

				this.updateBlockedSettings(result);
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				const isNoneSelected = this.isNone(deviceStore.cameraDeviceId);

				if (!isNoneSelected) {
					// Set error only if a real device is selected.
					this.setDeviceError(error, true);
				}

				this.setEnabled(true);

				// List all available video devices.
				Devices.enumerateVideoDeviceNames()
					.then((result: DeviceInfo) => {
						this.updateModel(result, !isNoneSelected);
					});
			})
			.finally(() => {
				this.initialized = true;
			});
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.cameraSelect) {
			this.cameraSelect.value = deviceStore.cameraDeviceId;
		}
	}

	protected override updateModel(result: DeviceInfo, cameraBlocked: boolean) {
		const devices = result.devices;
		const stream = result.stream;

		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		this.videoInputDevices = devices.filter(device => device.kind === "videoinput");
		this.inputBlocked = cameraBlocked;

		this.video.srcObject = stream || null;
		this.video.muted = true;

		if (!this.videoInputDevices.find(devInfo => { return devInfo.deviceId === deviceStore.cameraDeviceId })) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);

			this.video.style.visibility = "hidden";
		}

		this.setEnabled(true);
	}

	private isNone(name: string) {
		return name === "none";
	}

	private updateBlockedSettings(info: DeviceInfo) {
		deviceStore.cameraBlocked = info && info.stream ? info.stream.getVideoTracks().length < 1 : true;
	}

	private onCameraChange(event: Event) {
		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		const videoSource = (<HTMLInputElement> event.target).value;
		const videoConstraints: MediaStreamConstraints = {};

		deviceStore.cameraDeviceId = videoSource;

		if (this.isNone(videoSource)) {
			this.video.style.visibility = "hidden";
			this.inputBlocked = false;
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
				this.video.style.visibility = "visible";

				this.inputBlocked = false;
			})
			.catch(error => {
				console.error(error);

				this.setDeviceError(error, false);
			});
	}

	protected override render() {
		return html`
			<player-loading .text="${t("devices.querying")}"></player-loading>

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.permission")}</strong>
			</sl-alert>
			<sl-alert variant="warning" .open="${this.inputBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.camera.blocked")}</strong>
			</sl-alert>

			<form id="device-select-form">
				${when(courseStore.activeCourse.isConference, () => html`
				<sl-switch id="cameraMuteOnEntry" name="cameraMuteOnEntry" size="small" ?checked=${deviceStore.cameraMuteOnEntry}>${t("devices.camera.mute.on.entry")}</sl-switch>
				`)}

				<div class="video-container">
					<div class="controls">
						<sl-select @sl-change="${this.onCameraChange}" name="cameraDeviceId" label="${t("devices.camera")}" id="cameraSelect" size="small" hoist>
							<sl-option value="none">${t("devices.none")}</sl-option>
							${this.renderDeviceOptions(this.videoInputDevices)}
						</sl-select>
					</div>
					<video id="cameraPreview" class="video" playsinline autoplay muted></video>
				</div>
			</form>
		`;
	}
}
