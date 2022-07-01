import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { participantViewStyles } from "./participant-view.styles";

@customElement('participant-view')
export class ParticipantView extends I18nLitElement {

	static styles = [
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


	constructor() {
		super();

		document.addEventListener("player-volume", this.onAudioVolume.bind(this));
		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
	}

	addAudio(audio: HTMLAudioElement) {
		this.container.appendChild(audio);
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
					<svg xmlns="http://www.w3.org/2000/svg" id="mic-muted" width="16" height="16" fill="currentColor" class="bi bi-mic-mute-fill" viewBox="0 0 16 16">
						<path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
						<path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
					</svg>
					<div class="buttons">
						<button @click="${this.onAudioMute}">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-mic" viewBox="0 0 16 16">
								<path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
								<path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-mic-mute" viewBox="0 0 16 16">
								<path d="M13 8c0 .564-.094 1.107-.266 1.613l-.814-.814A4.02 4.02 0 0 0 12 8V7a.5.5 0 0 1 1 0v1zm-5 4c.818 0 1.578-.245 2.212-.667l.718.719a4.973 4.973 0 0 1-2.43.923V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 1 0v1a4 4 0 0 0 4 4zm3-9v4.879L5.158 2.037A3.001 3.001 0 0 1 11 3z"/>
								<path d="M9.486 10.607 5 6.12V8a3 3 0 0 0 4.486 2.607zm-7.84-9.253 12 12 .708-.708-12-12-.708.708z"/>
							</svg>
						</button>
						<button @click="${this.onVideoMute}">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-cam" viewBox="0 0 16 16">
								<path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2V5z"/>
							</svg>
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="icon-cam-mute" viewBox="0 0 16 16">
								<path fill-rule="evenodd" d="M10.961 12.365a1.99 1.99 0 0 0 .522-1.103l3.11 1.382A1 1 0 0 0 16 11.731V4.269a1 1 0 0 0-1.406-.913l-3.111 1.382A2 2 0 0 0 9.5 3H4.272l6.69 9.365zm-10.114-9A2.001 2.001 0 0 0 0 5v6a2 2 0 0 0 2 2h5.728L.847 3.366zm9.746 11.925-10-14 .814-.58 10 14-.814.58z"/>
							</svg>
						</button>
					</div>
				</div>
			</div>
		`;
	}
}