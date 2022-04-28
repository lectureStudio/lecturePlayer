import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MediaPlayer } from '../../media/media-player';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement } from '../i18n-mixin';
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
	courseId: number = 2;

	@property()
	startTime: number = 0;

	@query("player-controls")
	controls: PlayerControls;

	@query("#video-feed-container")
	videoFeedContainer: HTMLElement;


	override firstUpdated(_changedProperties: PropertyValues): void {
		this.controls.addEventListener("player-volume", (e: CustomEvent) => {
			this.mediaPlayer.muted = false;
			this.mediaPlayer.volume = e.detail;
		}, false);
		this.controls.addEventListener("player-mute", (e: CustomEvent) => {
			this.mediaPlayer.muted = e.detail;
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
					this.controls.duration = (Date.now() - this.startTime);
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
					<player-controls></player-controls>
				</div>
			</div>
			<div class="right-container" id="right-container">
				<div class="video-feed-container" id="video-feed-container">
				</div>
				<div class="order-md-last order-last mt-auto d-flex flex-row d-sm-none d-md-block d-none d-sm-block chat-container" id="chatContainer">
				</div>
			</div>

		`;
	}
}
