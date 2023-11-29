import { CSSResultGroup, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { I18nLitElement } from "../i18n-mixin";
import { CourseParticipant } from "../../model/participant";
import { Component } from "../component";
import { Devices } from "../../utils/devices";
import screenViewStyles from "./screen-view.css";

@customElement('screen-view')
export class ScreenView extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		screenViewStyles
	];

	@property({ type: Boolean, reflect: true })
	private hasVideo: boolean = false;

	@query("video")
	private video: HTMLVideoElement;

	participant: CourseParticipant;


	constructor() {
		super();

		document.addEventListener("player-start-media", this.onStartMediaPlayback.bind(this));
	}

	protected override firstUpdated() {
		this.setVideoStream(this.participant.screenStream);
	}

	protected override render() {
		return html`
			<div class="container">
				<video autoplay playsInline></video>
			</div>
		`;
	}

	private setHasVideo(has: boolean) {
console.log("** has video", has)

		this.hasVideo = has;
	}

	private setVideoVisibility() {
		if (!this.video) {
			return;
		}

		const stream = this.video.srcObject as MediaStream;
		const tracks = stream.getVideoTracks();

		if (stream.getVideoTracks().length > 0) {
			const track = tracks[0];

			this.setHasVideo(!track.muted && this.participant.screenActive);
		}
	}

	private setVideoStream(stream: MediaStream | null) {
		Devices.attachMediaStream(this.video, stream);

		if (!stream) {
			return;
		}

		const tracks = stream.getVideoTracks();

		if (tracks.length > 0) {
			const track = tracks[0];

			track.addEventListener("mute", () => {
				this.setHasVideo(false);
			});
			track.addEventListener("unmute", () => {
				this.setHasVideo(!track.muted && this.participant.screenActive);
			});

			this.setHasVideo(!track.muted && this.participant.screenActive);
		}

		this.video.play()
			.catch(error => {
				if (error.name == "NotAllowedError") {
					this.dispatchEvent(Utils.createEvent("participant-video-play-error"));
				}
			});
	}

	private onStartMediaPlayback() {
		if (this.video) {
			this.video.play()
				.then(() => {
					this.setVideoVisibility();
				});
		}
	}
}