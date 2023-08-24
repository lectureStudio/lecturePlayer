import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Devices } from "../../utils/devices";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { courseStore } from "../../store/course.store";
import { autorun, observable } from "mobx";
import { deviceStore } from "../../store/device.store";
import { CourseParticipant, Participant } from "../../model/participant";
import { Component } from "../component";
import participantViewStyles from "./participant-view.scss";

@customElement('participant-view')
export class ParticipantView extends Component {

	static styles = [
		I18nLitElement.styles,
		participantViewStyles
	];

	@observable
	participant: CourseParticipant;

	@property({ type: Boolean, reflect: true })
	micActive: boolean = false;

	@property({ type: Boolean, reflect: true })
	camActive: boolean = false;

	@property({ type: Boolean, reflect: true })
	isVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	isTalking: boolean = false;

	@property({ type: Boolean, reflect: true })
	isConference: boolean = false;

	@property()
	isLocal: boolean = false;

	publisherId: bigint;

	@query(".container")
	container: HTMLElement;

	@query("audio")
	audio: HTMLAudioElement;

	@query("video")
	video: HTMLVideoElement;


	constructor() {
		super();

		document.addEventListener("lect-speaker-volume", this.onAudioVolume.bind(this));
		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
		document.addEventListener("lect-device-change", this.onDeviceChange.bind(this));

		autorun(() => {
			if (this.audio) {
				Devices.setAudioSink(this.audio, deviceStore.speakerDeviceId);
			}
		});

		this.isConference = courseStore.conference;
	}

	protected firstUpdated() {
		autorun(() => {
			this.setAudioStream(this.participant.microphoneStream);
		});
		autorun(() => {
			this.setVideoStream(this.participant.cameraStream);
		});
	}

	protected render() {
		this.micActive = this.participant.microphoneActive ?? false;
		this.camActive = this.participant.cameraActive ?? false;

		return html`
			<div part="base" class="container">
				<span class="name">${Participant.getFullName(this.participant)}</span>
				<div class="controls">
					<div class="media-state">
						<div class="mic-state">
							<sl-icon .name="${this.getMicrophoneIcon()}" id="mic-remote"></sl-icon>
						</div>
					</div>
				</div>

				<audio autoplay></audio>
				<video autoplay playsInline></video>
			</div>
		`;
	}

	private getMicrophoneIcon() {
		return (this.participant.microphoneActive ?? false) ? "microphone" : "microphone-mute";
	}

	private onStartMediaPlayback(e: CustomEvent) {
		if (this.audio) {
			this.audio.play();
		}
		if (this.video) {
			this.video.play();
		}
	}

	private onDeviceChange(event: CustomEvent) {
		if (this.audio) {
			const deviceSetting: MediaDeviceSetting = event.detail;
			const deviceId = deviceSetting.deviceId;

			if (deviceSetting.kind !== "audiooutput") {
				// As subscriber we are interested only in speaker devices.
				return;
			}

			Devices.setAudioSink(this.audio, deviceId);
		}
	}

	private onAudioVolume(e: CustomEvent) {
		if (this.audio) {
			const volume: number = e.detail.volume;

			this.audio.volume = volume;
		}
	}

	private setAudioStream(stream: MediaStream) {
		Devices.attachMediaStream(this.audio, stream);

		if (!stream) {
			return;
		}

		// Set speaker output device.
		Devices.setAudioSink(this.audio, deviceStore.speakerDeviceId);

		this.audio.volume = deviceStore.speakerVolume;
		this.audio.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-audio-play-error"));
				}
			});
	}

	private setVideoStream(stream: MediaStream) {
		Devices.attachMediaStream(this.video, stream);

		if (!stream) {
			return;
		}

		const tracks = stream.getVideoTracks();

		if (tracks.length > 0) {
			const track = tracks[0];

			track.addEventListener("mute", (e) => {
				this.camActive = false;
			});
			track.addEventListener("unmute", (e) => {
				this.camActive = !track.muted && this.participant.cameraActive;
			});

			this.camActive = this.isLocal || (!track.muted && this.participant.cameraActive);
		}

		this.video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}
}