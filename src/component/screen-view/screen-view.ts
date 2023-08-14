import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { State } from "../../utils/state";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import screenViewStyles from "./screen-view.scss";

@customElement('screen-view')
export class ScreenView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		screenViewStyles
	];

	@property({ type: State, reflect: true })
	private state: State = State.DISCONNECTED;

	@property({ type: Boolean, reflect: true })
	private hasVideo: boolean = false;

	@query(".container")
	private container: HTMLElement;

	@query("video")
	private video: HTMLVideoElement;


	constructor() {
		super();

		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
	}

	addVideo(video: HTMLVideoElement) {
		if (!video) {
			if (Utils.isFirefox()) {
				// Firefox does not remove/close the media stream. The stream starts playing again,
				// if the remote peer starts sharing media.
				this.setHasVideo(true);
			}
			return;
		}

		const stream = video.srcObject as MediaStream;
		const tracks = stream.getVideoTracks();

		if (stream.getVideoTracks().length > 0) {
			const track = tracks[0];

			track.addEventListener("mute", (e) => {
				this.setHasVideo(false);
			});
			track.addEventListener("unmute", (e) => {
				this.setHasVideo(!track.muted && this.state === State.CONNECTED);
			});

			this.setHasVideo(!track.muted && this.state === State.CONNECTED);
		}

		this.container.appendChild(video);

		video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	removeVideo() {
		if (!Utils.isFirefox()) {
			// Firefox does not remove/close the media stream. The stream starts playing again,
			// if the remote peer starts sharing media. Other browsers do.
			// Thus do not remove the video element.
			this.removeMedia("video");
		}

		this.setHasVideo(false);
	}

	setVideoVisible(visible: boolean) {
		this.setHasVideo(visible);
	}

	setState(state: State) {
		this.state = state;
	}

	private setHasVideo(has: boolean) {
		this.hasVideo = has;

		this.dispatchEvent(Utils.createEvent("screen-view-video", {
			hasVideo: this.hasVideo
		}));
	}

	private setVideoVisibility(video: HTMLVideoElement) {
		if (!video) {
			return;
		}

		const stream = video.srcObject as MediaStream;
		const tracks = stream.getVideoTracks();

		if (stream.getVideoTracks().length > 0) {
			const track = tracks[0];

			this.setHasVideo(!track.muted && this.state === State.CONNECTED);
		}
	}

	private onStartMediaPlayback(e: CustomEvent) {
		if (this.video) {
			this.video.play()
				.then(() => {
					this.setVideoVisibility(this.video);
				});
		}
	}

	private removeMedia(type: string) {
		const element = this.container.querySelector(type);

		if (element) {
			this.container.removeChild(element);
		}
	}

	render() {
		return html`
			<div class="container"></div>
		`;
	}
}