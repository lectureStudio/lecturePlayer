import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MediaPlayer } from '../../media/media-player';
import { CourseState } from '../../model/course-state';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement, t } from '../i18n-mixin';
import { SettingsModal } from '../settings-modal/settings-modal';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	private mediaPlayer: MediaPlayer;

	@property()
	courseId: number;

	@property()
	courseState: CourseState;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean;

	@query("player-controls")
	controls: PlayerControls;

	@query("#video-feed-container")
	videoFeedContainer: HTMLElement;


	firstUpdated(_changedProperties: PropertyValues): void {
		this.controls.addEventListener("player-volume", (e: CustomEvent) => {
			// this.mediaPlayer.muted = false;
			// this.mediaPlayer.volume = e.detail.volume;
		}, false);
		this.controls.addEventListener("player-chat-visibility", (e: CustomEvent) => {
			this.chatVisible = !this.chatVisible;
		}, false);
		this.controls.addEventListener("player-settings", (e: CustomEvent) => {
			const settingsModal = new SettingsModal();
			settingsModal.open();
		}, false);
	}

	getSlideView(): SlideView {
		return this.renderRoot.querySelector("slide-view");
	}

	getVideo(id: BigInt, primary: boolean): HTMLVideoElement {
		let video: HTMLVideoElement = this.renderRoot.querySelector("#video-feed-" + id);

		if (!video) {
			video = this.createVideoElement(id.toString());

			const div = this.createVideoContainer(id.toString());
			div.appendChild(video);

			this.videoFeedContainer.appendChild(div);

			if (primary && !this.mediaPlayer) {
				this.mediaPlayer = new MediaPlayer(video);
				this.mediaPlayer.muted = false;
				this.mediaPlayer.addTimeListener(() => {
					this.controls.duration = (Date.now() - this.courseState.timeStarted);
				});
			}
		}

		return video;
	}

	getLocalVideo(): HTMLVideoElement {
		let video: HTMLVideoElement = this.renderRoot.querySelector("#video-feed-local");

		if (!video) {
			video = this.createVideoElement("local");
			video.muted = true;

			const div = this.createVideoContainer("local");
			div.appendChild(video);

			this.videoFeedContainer.appendChild(div);
		}

		return video;
	}

	removeVideo(id: BigInt): void {
		const videoFeedDiv = this.renderRoot.querySelector("#video-feed-div-" + id);

		this.videoFeedContainer.removeChild(videoFeedDiv);
	}

	private createVideoElement(id: string): HTMLVideoElement {
		const video = document.createElement("video");
		video.id = "video-feed-" + id;
		video.autoplay = true;
		video.playsInline = true;

		return video;
	}

	private createVideoContainer(id: string): HTMLElement {
		const div = document.createElement("div");
		div.id = "video-feed-div-" + id;
		div.classList.add("feed-container", "invisible");

		return div;
	}

	render() {
		return html`
			<div class="center-container">
				<div class="slide-container">
					<slide-view></slide-view>
				</div>
				<div class="controls-container">
					<player-controls .hasChat="${this.courseState?.messageFeature !== null}" .chatVisible="${this.chatVisible}"></player-controls>
				</div>
			</div>
			<div class="right-container">
				<div class="video-feed-container">
				</div>
				<div class="chat-container">
					<chat-box .courseId="${this.courseId}" .featureId="${this.courseState?.messageFeature?.featureId}"></chat-box>
				</div>
			</div>
		`;
	}
}
