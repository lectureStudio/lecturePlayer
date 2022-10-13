import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { MediaType } from "../../model/media-type";
import { State } from "../../utils/state";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { participantViewStyles } from "./participant-view.styles";

@customElement('participant-view')
export class ParticipantView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		participantViewStyles
	];

	@property({ type: State, reflect: true })
	private state: State = State.DISCONNECTED;

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

	screenVideo: HTMLVideoElement;

	volume: number;


	constructor() {
		super();

		document.addEventListener("player-volume", this.onAudioVolume.bind(this));
		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
	}

	setState(state: State) {
		this.state = state;

		this.dispatchEvent(Utils.createEvent("participant-state", {
			participant: this,
			state: state
		}));
	}

	addAudio(audio: HTMLAudioElement) {
		this.container.appendChild(audio);

		// Set current volume.
		this.audio.volume = this.volume;

		audio.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	removeAudio() {
		this.removeMedia("audio");
	}

	addVideo(video: HTMLVideoElement) {
		const stream = video.srcObject as MediaStream;
		const tracks = stream.getVideoTracks();

		if (tracks.length > 0) {
			const track = tracks[0];

			track.addEventListener("mute", (e) => {
				this.hasVideo = false;
			});
			track.addEventListener("unmute", (e) => {
				this.hasVideo = !track.muted && this.state !== State.DISCONNECTED;
			});

			this.hasVideo = this.isLocal || (!track.muted && this.state === State.CONNECTED);
		}

		this.container.appendChild(video);

		video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	addScreenVideo(video: HTMLVideoElement) {
		this.screenVideo = video;

		this.dispatchEvent(Utils.createEvent("participant-screen-stream", {
			participant: this,
			state: State.CONNECTED,
			video: video,
		}));
	}

	removeVideo() {
		this.removeMedia("video");
		this.hasVideo = false;
	}

	removeScreenVideo() {
		this.screenVideo = null;

		this.dispatchEvent(Utils.createEvent("participant-screen-stream", {
			participant: this,
			state: State.DISCONNECTED,
		}));
	}

	setMediaChange(type: MediaType, active: boolean) {
		if (type === MediaType.Audio) {
			this.micMute = !active;
		}
		else if (type === MediaType.Camera) {
			this.camMute = !active;
			this.hasVideo = active;
		}
		else if (type === MediaType.Screen) {
			this.dispatchEvent(Utils.createEvent("participant-screen-stream", {
				participant: this,
				state: active ? State.CONNECTED : State.DISCONNECTED,
			}));
		}
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
		if (this.audio) {
			this.audio.play();
		}
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