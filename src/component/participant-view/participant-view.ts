import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { MediaType } from "../../model/media-type";
import { Devices } from "../../utils/devices";
import { State } from "../../utils/state";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { courseStore } from "../../store/course.store";
import { autorun, observable } from "mobx";
import { deviceStore } from "../../store/device.store";
import { CourseParticipant, Participant } from "../../model/participant";
import participantViewStyles from "./participant-view.scss";

@customElement('participant-view')
export class ParticipantView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantViewStyles
	];

	@property()
	@observable
	participant: CourseParticipant;

	@property({ type: Boolean, reflect: true })
	camActive: boolean = false;

	@property({ type: Boolean, reflect: true })
	micActive: boolean = false;

	@property({ type: Boolean, reflect: true })
	micMute: boolean = false;

	@property({ type: Boolean, reflect: true })
	camMute: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasVideo: boolean = false;

	@property({ type: Boolean, reflect: true })
	isLocal: boolean = false;

	@property({ type: Boolean, reflect: true })
	isVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	isTalking: boolean = false;

	publisherId: bigint;

	@query(".container")
	container: HTMLElement;

	@query("audio")
	audio: HTMLAudioElement;

	@query("video")
	video: HTMLVideoElement;

	@property({ type: Boolean, reflect: true })
	isConference: boolean = false;


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

	addScreenVideo(video: HTMLVideoElement) {
		this.dispatchEvent(Utils.createEvent("participant-screen-stream", {
			participant: this,
			state: State.CONNECTED,
			video: video,
		}));
	}

	removeScreenVideo() {
		this.dispatchEvent(Utils.createEvent("participant-screen-stream", {
			participant: this,
			state: State.DISCONNECTED,
		}));
	}

	setMediaChange(type: MediaType, active: boolean) {
		if (type === MediaType.Audio) {
			this.micActive = active;
			this.micMute = !active;
		}
		else if (type === MediaType.Camera) {
			this.camActive = active;
			this.camMute = !active;
			this.hasVideo = active;
		}
		else if (type === MediaType.Screen) {
			this.dispatchEvent(Utils.createEvent("participant-screen-visibility", {
				participant: this,
				visible: active,
			}));
		}
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

	private onAudioMute(e: CustomEvent) {
		this.micMute = !this.micMute;
		this.dispatchEvent(Utils.createEvent("participant-mic-mute", {
			mute: this.micMute
		}));
	}

	private onVideoMute() {
		this.camMute = !this.camMute;
		this.dispatchEvent(Utils.createEvent("participant-cam-mute", {
			camMute: this.camMute
		}));
	}

	protected firstUpdated() {
		console.log(this.participant)

		autorun(() => {
			this.setAudioStream(this.participant.microphoneStream);
		});
		autorun(() => {
			console.log(" * autorun camera stream")
			this.setVideoStream(this.participant.cameraStream);
		});
	}

	protected render() {
		return html`
			<div part="base" class="container">
				<span class="name">${Participant.getFullName(this.participant)}</span>
				<div class="controls">
					<div class="media-state">
						<div class="mic-state">
							<sl-icon name="microphone" id="mic-remote"></sl-icon>
							<sl-icon name="microphone-mute" id="mic-remote-muted"></sl-icon>
						</div>
					</div>
					<div class="buttons">
						<sl-button @click="${this.onAudioMute}" class="conference-control">
							<sl-icon name="microphone" id="mic-local"></sl-icon>
							<sl-icon name="microphone-mute" id="mic-local-muted"></sl-icon>
						</sl-button>
						<sl-button @click="${this.onVideoMute}" class="conference-control">
							<sl-icon name="camera" id="cam-local"></sl-icon>
							<sl-icon name="camera-mute" id="cam-local-muted"></sl-icon>
						</sl-button>
					</div>
				</div>

				<audio autoplay></audio>
				<video autoplay playsInline></video>
			</div>
		`;
	}

	private setAudioStream(stream: MediaStream) {
console.log(" * set audio stream", stream)

		this.attachMediaStream(this.audio, stream);

		if (!stream) {
			return;
		}

		// Set speaker output device.
		Devices.setAudioSink(this.audio, deviceStore.speakerDeviceId);

		this.audio.volume = deviceStore.speakerVolume;
		this.audio.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	private setVideoStream(stream: MediaStream) {
console.log(" * set video stream", stream)

		this.attachMediaStream(this.video, stream);

		if (!stream) {
			return;
		}

		const tracks = stream.getVideoTracks();

		if (tracks.length > 0) {
			const track = tracks[0];

			track.addEventListener("mute", (e) => {
				this.hasVideo = false;
			});
			track.addEventListener("unmute", (e) => {
				this.hasVideo = !track.muted && !this.participant.cameraMuted;
			});

			this.hasVideo = this.isLocal || (!track.muted && !this.participant.cameraMuted);

			console.log(" * set video play", this.isLocal, track.muted, this.participant.cameraMuted)
		}

		this.video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	private attachMediaStream(element: HTMLMediaElement, stream: MediaStream) {
		try {
			element.srcObject = stream;
		}
		catch (e) {
			console.error("Error attaching stream to element", e);
		}
	}
}