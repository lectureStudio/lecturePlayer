import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { I18nLitElement } from "../i18n-mixin";
import { participantViewStyles } from "./participant-view.styles";

@customElement('participant-view')
export class ParticipantView extends I18nLitElement {

	static styles = [
		participantViewStyles
	];

	@property()
	name: string = "Alex Andres";

	@property({ type: Boolean, reflect: true })
	micMuted: boolean = false;

	@property({ type: Boolean, reflect: true })
	camMuted: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasVideo: boolean = false;

	@query(".container")
	container: HTMLElement;

	@query("audio")
	audio: HTMLAudioElement;


	constructor() {
		super();

		document.addEventListener("player-volume", this.onAudioVolume.bind(this));
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

	private onAudioVolume(e: CustomEvent) {
		if (this.audio) {
			const volume: number = e.detail.volume;

			this.audio.volume = volume;
		}
	}

	render() {
		return html`
			<div class="container">
				<span class="name">${this.name}</span>
				<div class="controls">
					<svg id="mic-muted">
						<use xlink:href="/icons.svg#mic-mute-fill"></use>
					</svg>
				</div>
			</div>
		`;
	}
}