import { SlSelect } from "@shoelace-style/shoelace";
import { CSSResultGroup, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { DeviceInfo, Devices } from "../../utils/devices";
import { VirtualBackground } from "../../utils/virtual-background";
import { t } from "../i18n-mixin";
import { MediaSettings } from "../media-settings/media-settings";
import styles from './video-settings.css';

@customElement("video-settings")
export class VideoSettings extends MediaSettings {

	static override styles = <CSSResultGroup>[
		MediaSettings.styles,
		styles
	];

	private virtualBackground: VirtualBackground;

	@property({ type: Boolean })
	accessor active: boolean;

	@state()
	accessor videoInputDevices: MediaDeviceInfo[] = [];

	@query('#cameraPreview')
	accessor video: HTMLVideoElement;

	@query('#cameraSelect')
	accessor cameraSelect: SlSelect;


	override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (name === "active") {
			if (newValue != null) {
				this.queryDevices();
			}
			else {
				this.stopCapture();
			}
		}
	}

	protected override async firstUpdated() {
		super.firstUpdated();

		this.virtualBackground = new VirtualBackground();
	}

	override queryDevices(): void {
		const noneSelected = this.isNone(deviceStore.cameraDeviceId);

		if (this.initialized && noneSelected) {
			return;
		}

		this.setQuerying(true);

		Devices.enumerateVideoDevices()
			.then((result: DeviceInfo) => {
				this.updateBlockedSettings(result);
				this.updateModel(result);
			})
			.catch(error => {
				console.error(error.name, error);

				this.setVideoVisible(false);

				if (Devices.noPermission(error)) {
					this.setDeviceError(error);
				}
				else {
					this.setEnabled(true);

					// List all available video devices.
					Devices.enumerateVideoDeviceNames()
						.then((result: DeviceInfo) => {
							this.updateModel(result, !noneSelected);
						});
				}
			})
			.finally(() => {
				this.initialized = true;
				this.setQuerying(false);
			});
	}

	protected override updateModel(result: DeviceInfo, cameraBlocked: boolean = false): void {
		const devices = result.devices;
		const stream = result.stream;

		this.stopCapture();

		this.videoInputDevices = devices.filter(device => device.kind === "videoinput");
		this.inputBlocked = cameraBlocked;

		// this.video.srcObject = stream || null;
		// this.video.muted = true;

		if (!this.videoInputDevices.find(devInfo => { return devInfo.deviceId === deviceStore.cameraDeviceId })) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);

			this.setVideoVisible(false);
		}

		// this.updateCanvasSize();
		// this.virtualBackground.setCanvas(this.canvas);
		this.virtualBackground.setVideoStream(stream!);
		this.virtualBackground.start()
			.then(track => {
				console.log(track);

				const newStream = new MediaStream();
				newStream.addTrack(track)

				this.video.srcObject = newStream || null;
				this.video.muted = true;
			});

		this.setQuerying(false);
		this.setEnabled(true);
	}

	protected override setEnabled(enabled: boolean) {
		super.setEnabled(enabled);

		if (this.cameraSelect) {
			this.cameraSelect.value = deviceStore.cameraDeviceId;
		}
	}

	private stopCapture() {
		this.virtualBackground.stop();

		if (this.video) {
			Devices.stopVideoTracks(this.video.srcObject as MediaStream);

			this.video.srcObject = null;
		}
	}

	private updateBlockedSettings(info: DeviceInfo) {
		deviceStore.cameraBlocked = info && info.stream ? info.stream.getVideoTracks().length < 1 : true;
	}

	private isNone(name: string) {
		return name === "none";
	}

	private setVideoVisible(visible: boolean) {
		this.video.style.display = visible ? "inherit" : "none";
	}

	private onCameraChange(event: Event) {
		Devices.stopVideoTracks(this.video.srcObject as MediaStream);

		const videoSource = (<HTMLInputElement> event.target).value;
		const videoConstraints: MediaStreamConstraints = {};

		deviceStore.setCameraDeviceId(videoSource);

		if (this.isNone(videoSource)) {
			this.setVideoVisible(false);
			this.inputBlocked = false;
			return;
		}

		this.setQuerying(true);

		videoConstraints.video = {
			deviceId: videoSource ? { exact: videoSource } : undefined,
			width: { ideal: 1280 },
			height: { ideal: 720 },
			facingMode: "user"
		};

		navigator.mediaDevices.getUserMedia(videoConstraints)
			.then(videoStream => {
				const newStream = new MediaStream();

				if (this.video.srcObject) {
					(<MediaStream> this.video.srcObject).getAudioTracks().forEach(track => newStream.addTrack(track));
				}

				videoStream.getVideoTracks().forEach(track => newStream.addTrack(track));

				this.video.srcObject = newStream;
				this.inputBlocked = false;

				this.setQuerying(false);
				this.setVideoVisible(true);
			})
			.catch(error => {
				console.error(error);

				this.setQuerying(false);
				this.setDeviceError(error);
			});
	}

	private updateCanvasSize() {
		// Adapt the canvas to the size of the video element.
		const width = this.video.videoWidth;
		const height = this.video.videoHeight;

		console.log(width, height)

		// if (this.canvas.width !== width || this.canvas.height !== height) {
		// 	this.canvas.width = width;
		// 	this.canvas.height = height;
		// }
	}

	protected override render() {
		return html`
			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.video.permission")}</strong>
			</sl-alert>
			<sl-alert variant="warning" .open="${this.inputBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.video.blocked")}</strong>
			</sl-alert>

			<form id="device-select-form">
				<span>${t("settings.video.webcam")}</span>
				<div class="content">
					<div class="controls">
						<sl-select @sl-change="${this.onCameraChange}" name="cameraDeviceId" id="cameraSelect" size="small" hoist>
							<sl-option value="none">${t("devices.none")}</sl-option>
							${this.renderDeviceOptions(this.videoInputDevices)}
						</sl-select>
					</div>
					<div class="video-container">
						${when(this.querying, () => html`
							<loading-indicator .text="${t("devices.querying")}"></loading-indicator>
						`, () => html`
							<sl-icon name="webcam-mute"></sl-icon>
						`)}

						<video id="cameraPreview" playsinline autoplay muted></video>
					</div>
				</div>

				${when(courseStore.activeCourse?.isConference ?? false, () => html`
					<span></span>
					<sl-switch id="cameraMuteOnEntry" name="cameraMuteOnEntry" size="small" ?checked=${deviceStore.cameraMuteOnEntry}>${t("devices.camera.mute.on.entry")}</sl-switch>
				`)}
			</form>
		`;
	}
}
