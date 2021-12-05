import { SlideView } from "../../api/view/slide.view";
import { Observer } from "../../utils/observable";
import { WebSlideView } from "../slide-view/web-slide.view";
import { ViewElement } from "../view-element";
import { WebViewElement } from "../web-view-element";
import { WebPlayerControls } from "../../component/player-controls/player-controls";
import { PlaybackModel } from "../../model/playback-model";

@ViewElement({
	selector: "player-view",
	templateUrl: "player.view.html",
	styleUrls: ["player.view.css"]
})
class PlayerView extends WebViewElement {

	private readonly playbackModel: PlaybackModel;

	private slideView: WebSlideView;

	private playerControls: WebPlayerControls;

	private videoFeed: HTMLMediaElement;

	private videoFeedContainer: HTMLElement;

	private mainVideoFeedContainer: HTMLElement;

	private localVideoFeedContainer: HTMLElement;

	private containerA: HTMLElement;

	private rightContainer: HTMLElement;


	constructor(model: PlaybackModel) {
		super();

		this.playbackModel = model;
	}

	connectedCallback() {
		const elementA = this.playbackModel.elementAProperty.value;

		if (elementA) {
			this.setElementA(elementA);
		}

		// const video = this.getElementById("videoFeed") as HTMLVideoElement;
		this.videoFeed.addEventListener("canplay", () => {
			this.videoFeed.play()
				.catch(error => {
					if (error.name == "NotAllowedError") {
						this.cannotPlay();
					}
				});
		});
		this.videoFeed.addEventListener("play", () => {
			window.dispatchEvent(new Event("resize"));
		});

		this.playbackModel.elementAProperty.subscribe(this.setElementA.bind(this));
		this.playbackModel.videoAvailableProperty.subscribe(this.setVideoAvailable.bind(this));
		this.playbackModel.mainVideoAvailableProperty.subscribe(this.setMainVideoAvailable.bind(this));
		this.playbackModel.localVideoAvailableProperty.subscribe(this.setLocalVideoAvailable.bind(this));

		this.playerControls.setOnRaiseHand(this.playbackModel.raisedHandProperty);
		this.playerControls.setOnRaiseHandActive(this.playbackModel.webrtcPublisherConnectedProperty);
		this.playerControls.setOnShowQuiz(this.playbackModel.showQuizProperty);
		this.playerControls.setOnShowQuizActive(this.playbackModel.showQuizActiveProperty);
		this.playerControls.setOnFullscreen((fullscreen: boolean) => {
			this.setFullscreen(fullscreen);
		});
		this.playerControls.setOnPlayMedia(() => {
			this.videoFeed.play()
				.then(() => {
					this.playerControls.setPlayMediaVisible(false);
				})
				.catch(error => {
					console.error(error);
				});
		});

		this.slideView.repaint();

		window.dispatchEvent(new Event("resize"));
	}

	getSlideView(): SlideView {
		return this.slideView;
	}

	getMediaElement(): HTMLMediaElement {
		return this.videoFeed;
	}

	setDuration(durationMs: number): void {
		this.playerControls.setDuration(durationMs);
	}

	setVolume(volume: number): void {
		this.playerControls.setVolume(volume);
	}

	setMuted(muted: boolean): void {
		this.playerControls.setMuted(muted);
	}

	setFullscreen(fullscreen: boolean): void {
		if (fullscreen) {
			this.classList.add("fullscreen");
		}
		else {
			this.classList.remove("fullscreen");
		}

		window.dispatchEvent(new Event('resize'));
	}

	setOnVolume(observer: Observer<number>): void {
		this.playerControls.setOnVolume(observer);
	}

	setOnMute(observer: Observer<boolean>): void {
		this.playerControls.setOnMute(observer);
	}

	setOnFullscreen(observer: Observer<boolean>): void {
		this.playerControls.setOnFullscreen(observer);
	}

	setOnSettings(observer: Observer<boolean>): void {
		this.playerControls.setOnSettings(observer);
	}

	private cannotPlay() {
		this.playerControls.setPlayMediaVisible(true);

		window.dispatchEvent(new Event("resize"));
	}

	private setElementA(element: HTMLElement): void {
		if (element) {
			this.containerA.appendChild(element);
		}
		else {
			while (this.containerA.firstChild) {
				this.containerA.removeChild(this.containerA.firstChild);
			}
		}

		this.updateRightContainer();
	}

	private setElementVisible(element: HTMLElement, visible: boolean) {
		if (visible) {
			element.classList.remove("invisible");
		}
		else {
			element.classList.add("invisible");
		}
	}

	private setVideoAvailable(available: boolean): void {
		this.setElementVisible(this.videoFeedContainer, available);
		this.updateRightContainer();
	}

	private setMainVideoAvailable(available: boolean): void {
		this.setElementVisible(this.mainVideoFeedContainer, available);
		this.updateRightContainer();
	}

	private setLocalVideoAvailable(available: boolean): void {
		this.setElementVisible(this.localVideoFeedContainer, available);
		this.updateRightContainer();
	}

	private updateRightContainer() {
		this.setElementVisible(this.rightContainer, this.playbackModel.videoAvailable
			|| this.playbackModel.localVideoAvailable || this.containerA.hasChildNodes());

		window.dispatchEvent(new Event("resize"));
	}
}

export { PlayerView };