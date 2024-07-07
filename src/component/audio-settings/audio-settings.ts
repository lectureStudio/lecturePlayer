import { SlSelect } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { AudioFeedback } from "../../utils/audio-feedback";
import { DeviceInfo, Devices } from "../../utils/devices";
import { VolumeMeter } from "../../utils/volume-meter";
import { t } from "../i18n-mixin";
import { MediaSettings } from "../media-settings/media-settings";

@customElement("audio-settings")
export class AudioSettings extends MediaSettings {

	private audioFeedback: AudioFeedback;

	private volumeMeter: VolumeMeter;

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
				this.queryDevices();
			}
			else {
				this.stopCapture();
			}
		}

		super.attributeChangedCallback(name, oldValue, newValue);
	}

	protected override async firstUpdated() {
		super.firstUpdated();

		this.audioFeedback = new AudioFeedback();
		this.volumeMeter = new VolumeMeter(this.meterCanvas);
	}

	queryDevices(): void {
		const constraints: MediaStreamConstraints = {
			audio: {
				noiseSuppression: false,
				autoGainControl: false,
			},
		};

		Devices.enumerateAudioDevices(true, constraints)
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

	private async setMediaStream(stream: MediaStream) {
		this.audioFeedback.setMediaStream(stream);
		this.volumeMeter.setMediaStream(stream);

		await this.volumeMeter.start();
	}

	protected override async updateModel(result: DeviceInfo, _cameraBlocked: boolean) {
		const devices = result.devices;
		const stream = result.stream;

		this.stopCapture();

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");

		this.audio.srcObject = stream || null;
		this.audio.muted = true;

		if (stream) {
			await this.setMediaStream(stream);
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

				await this.setMediaStream(audioStream);
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

	private async onAudioFeedback() {
		if (this.audioFeedback.isStarted()) {
			await this.audioFeedback.stop();
		}
		else {
			await this.audioFeedback.start();
		}
	}

	private stopCapture() {
		if (this.audio) {
			this.volumeMeter.stop();
			this.audioFeedback.stop();

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
						${when(courseStore.activeCourse?.isConference ?? false, () => html`
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

					<span>${t("settings.audio.feedback")}</span>
					<div class="content">
						<span>${t("settings.audio.feedback.description")}</span>
						<sl-button @click="${this.onAudioFeedback}" variant="${this.audioFeedback?.isStarted() ? "primary" : "default"}" size="small">
							${t(this.audioFeedback?.isStarted() ? "settings.audio.feedback.stop" : "settings.audio.feedback.start")}
							<sl-icon slot="prefix" name="${this.audioFeedback?.isStarted() ? "microphone-mute" : "microphone"}"></sl-icon>
						</sl-button>
					</div>
				</form>

				<audio id="audio" playsinline autoplay muted></audio>
			`)}
		`;
	}
}
