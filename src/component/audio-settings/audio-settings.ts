import { SlSelect } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { DeviceInfo, Devices } from "../../utils/devices";
import { t } from "../i18n-mixin";
import { MediaSettings } from "../media-settings/media-settings";

@customElement("audio-settings")
export class AudioSettings extends MediaSettings {

	private audioContext: AudioContext;

	@property({ type: Boolean })
	accessor active: boolean;

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


	override attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
		if (name === "active") {
			if (newValue != null) {
				console.log("queryDevices");
				this.queryDevices();
			}
			else {
				console.log("stopCapture");
				this.stopCapture();
			}
		}

		super.attributeChangedCallback(name, oldValue, newValue);
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

	protected override async updateModel(result: DeviceInfo, _cameraBlocked: boolean) {
		const devices = result.devices;
		const stream = result.stream;

		this.stopCapture();

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");

		this.audio.srcObject = result.stream || null;
		this.audio.muted = true;

		if (stream) {
			this.audioContext = new AudioContext();
			await this.audioContext.resume();

			try {
				Devices.getAudioLevel(this.audioContext, stream, this.meterCanvas).catch(reason => console.error(reason));
			}
			catch (e) {
				console.error(e);
			}
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
			.then(async audioStream => {
				audioStream.getAudioTracks().forEach(track => (<MediaStream>this.audio.srcObject).addTrack(track));

				await this.audioContext.resume();
				await Devices.getAudioLevel(this.audioContext, audioStream, this.meterCanvas);
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

	private stopCapture() {
		if (this.audio) {
			Devices.stopMediaTracks(<MediaStream> this.audio.srcObject);

			this.audio.srcObject = null;
		}
	}

	protected override render() {
		return html`
			<loading-indicator .text="${t("devices.querying")}"></loading-indicator>

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.permission")}</strong>
			</sl-alert>

			${when(!this.error, () => html`
				<form id="device-select-form">
					<span>${t("settings.audio.microphone")}</span>
					<div class="content">
						${when(courseStore.activeCourse?.isConference, () => html`
							<sl-switch id="microphoneMuteOnEntry" name="microphoneMuteOnEntry" size="small" ?checked=${deviceStore.microphoneMuteOnEntry}>${t("devices.microphone.mute.on.entry")}</sl-switch>
						`)}
						${this.renderDevices(this.audioInputDevices, this.onMicrophoneChange, "microphoneDeviceId", "microphoneSelect")}
						<canvas id="meter" width="300" height="5"></canvas>
					</div>

					<span>${t("settings.audio.speaker")}</span>
					<div class="content">
						${when(deviceStore.canSelectSpeaker, () => html`
							${this.renderDevices(this.audioOutputDevices, this.onSpeakerChange, "speakerDeviceId", "speakerSelect")}
						`)}
					</div>
				</form>

				<audio id="audio" playsinline autoplay muted></audio>
			`)}
		`;
	}
}
