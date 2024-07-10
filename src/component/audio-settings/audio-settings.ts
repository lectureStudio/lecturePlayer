import { SlSelect } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { courseStore } from "../../store/course.store";
import { deviceStore } from "../../store/device.store";
import { EchoTest } from "../../utils/echo-test";
import { DeviceInfo, Devices } from "../../utils/devices";
import { VolumeMeter } from "../../utils/volume-meter";
import { t } from "../i18n-mixin";
import { MediaSettings } from "../media-settings/media-settings";

@customElement("audio-settings")
export class AudioSettings extends MediaSettings {

	private echoTest: EchoTest;

	private volumeMeter: VolumeMeter;

	@property({ type: Boolean })
	accessor active: boolean;

	@state()
	accessor audioInputDevices: MediaDeviceInfo[] = [];

	@state()
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
	}

	protected override async firstUpdated() {
		super.firstUpdated();

		this.echoTest = new EchoTest();
		this.volumeMeter = new VolumeMeter(this.meterCanvas);
	}

	override queryDevices(): void {
		this.setQuerying(true);

		Devices.enumerateAudioDevices(true)
			.then((result: DeviceInfo) => {
				this.updateBlockedSettings(result);
				this.updateModel(result, false);
			})
			.catch(error => {
				console.error(error);

				this.setDeviceError(error);
			})
			.finally(() => {
				this.initialized = true;
				this.setQuerying(false);
			});
	}

	protected override async updateModel(result: DeviceInfo, _cameraBlocked: boolean) {
		const devices = result.devices;
		const stream = result.stream;

		this.stopCapture();

		this.audioInputDevices = devices.filter(device => device.kind === "audioinput");
		this.audioOutputDevices = devices.filter(device => device.kind === "audiooutput");

		if (stream) {
			await this.setMediaStream(stream);
		}

		this.setEnabled(true);
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
		this.audio.srcObject = stream;
		this.audio.muted = true;

		this.echoTest.setMediaStream(stream);
		this.volumeMeter.setMediaStream(stream);

		// Autostart volume-meter.
		await this.volumeMeter.start();
	}

	private updateBlockedSettings(info: DeviceInfo) {
		deviceStore.microphoneBlocked = info && info.stream ? info.stream.getAudioTracks().length < 1 : true;
	}

	private onMicrophoneChange(event: Event) {
		const echoTestStarted = this.echoTest.isStarted();

		this.stopCapture();

		const audioSource = (<HTMLInputElement> event.target).value;
		const audioConstraints = {
			audio: {
				deviceId: audioSource ? { exact: audioSource } : undefined
			}
		};

		deviceStore.setMicrophoneDeviceId(audioSource);

		navigator.mediaDevices.getUserMedia(audioConstraints)
			.then(async stream => {
				// stream.getAudioTracks().forEach(track => (<MediaStream>this.audio.srcObject).addTrack(track));

				await this.setMediaStream(stream);

				if (echoTestStarted) {
					await this.echoTest.start();
				}
			})
			.catch(error => {
				console.error(error);

				this.setDeviceError(error);
			});
	}

	private onSpeakerChange(event: Event) {
		const audioSink = (<HTMLInputElement> event.target).value;

		deviceStore.setSpeakerDeviceId(audioSink);

		Devices.setAudioSink(this.audio, audioSink);
	}

	private async onEchoTest() {
		if (this.echoTest.isStarted()) {
			await this.echoTest.stop();
		}
		else {
			await this.echoTest.start();
		}
	}

	private stopCapture() {
		if (this.audio) {
			this.volumeMeter.stop();
			this.echoTest.stop();

			Devices.stopAudioTracks(this.audio.srcObject as MediaStream);

			this.audio.srcObject = null;
		}
	}

	protected override render() {
		return html`
			${when(this.querying, () => html`
				<loading-indicator .text="${t("devices.querying")}"></loading-indicator>
			`)}

			<sl-alert variant="warning" .open="${this.devicesBlocked}">
				<sl-icon slot="icon" name="exclamation-triangle"></sl-icon>
				<strong>${t("devices.audio.permission")}</strong>
			</sl-alert>

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
					<sl-button @click="${this.onEchoTest}" variant="${this.echoTest?.isStarted() ? "primary" : "default"}" size="small">
						${t(this.echoTest?.isStarted() ? "settings.audio.feedback.stop" : "settings.audio.feedback.start")}
						<sl-icon slot="prefix" name="${this.echoTest?.isStarted() ? "microphone-mute" : "microphone"}"></sl-icon>
					</sl-button>
				</div>
			</form>

			<audio id="audio" playsinline autoplay muted></audio>
		`;
	}
}
