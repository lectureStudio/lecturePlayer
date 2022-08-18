import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { participantViewStyles } from "./participant-view.styles";

@customElement('participant-view')
export class ParticipantView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantViewStyles
	];

	@property()
	name: string;

	@property({ type: Boolean, reflect: true })
	micMute: boolean = false;

	@property({ type: Boolean, reflect: true })
	camMute: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasVideo: boolean = false;

	@property({ type: Boolean, reflect: true })
	isLocal: boolean = false;

	@query(".container")
	container: HTMLElement;

	@query("audio")
	audio: HTMLAudioElement;

	@query("video")
	video: HTMLVideoElement;

	volume: number;


	constructor() {
		super();

		document.addEventListener("player-volume", this.onAudioVolume.bind(this));
		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
	}

	addAudio(audio: HTMLAudioElement) {
		this.container.appendChild(audio);

		// Set current volume.
		this.audio.volume = this.volume;
	}

	removeAudio() {
		this.removeMedia("audio");
	}

	addVideo(video: HTMLVideoElement) {
		this.container.appendChild(video);
		this.hasVideo = true;

		video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	removeVideo() {
		this.removeMedia("video");
		this.hasVideo = false;
	}

	setVolume(volume: number) {
		this.volume = volume;
	}

	private removeMedia(type: string) {
		const element = this.container.querySelector(type);

		if (element) {
			this.container.removeChild(element);
		}
	}

	private onStartMediaPlayback(e: CustomEvent) {
		if (this.video) {
			this.video.play();
		}
	}

	private onAudioVolume(e: CustomEvent) {
		if (this.audio) {
			const volume: number = e.detail.volume;

			this.volume = volume;
			this.audio.volume = volume;
		}
	}

	private onAudioMute(): void {
		this.micMute = !this.micMute;

		this.dispatchEvent(Utils.createEvent("participant-mic-mute", {
			mute: this.micMute
		}));
	}

	private onVideoMute(): void {
		this.camMute = !this.camMute;

		this.dispatchEvent(Utils.createEvent("participant-cam-mute", {
			camMute: this.camMute
		}));
	}

	render() {
		return html`
			<div class="container">
				<span class="name">${this.name}</span>
				<div class="controls">
					<span class="icon-mic-muted" id="mic-muted"></span>
					<div class="buttons">
						<button @click="${this.onAudioMute}">
							<span class="icon-mic"></span>
							<span class="icon-mic-muted"></span>
						</button>
						<button @click="${this.onVideoMute}">
							<span class="icon-cam"></span>
							<span class="icon-cam-muted"></span>
						</button>
					</div>
				</div>
			</div>
		`;
	}
}