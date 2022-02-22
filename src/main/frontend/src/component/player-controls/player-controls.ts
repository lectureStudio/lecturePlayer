import { ViewElement } from "../../view/view-element";
import { WebViewElement } from "../../view/web-view-element";
import { Observer } from "../../utils/observable";
import { Property } from "../../utils/property";

@ViewElement({
	selector: "player-controls",
	templateUrl: "player-controls.html",
	styleUrls: ["player-controls.css"]
})
class WebPlayerControls extends WebViewElement {

	private controlContainer: HTMLElement;

	private fullscreenButton: HTMLElement;

	private playMediaButton: HTMLButtonElement;

	private chatButton: HTMLButtonElement;

	private settingsButton: HTMLButtonElement;

	private raiseHandButton: HTMLButtonElement;

	private showQuizButton: HTMLButtonElement;

	private volumeSlider: HTMLInputElement;

	private volumeIndicator: HTMLElement;

	private duration: HTMLSpanElement;

	private muteObserver: Observer<boolean>;


	constructor() {
		super();
	}

	connectedCallback() {
		this.updateVolumeIndicator(parseFloat(this.volumeSlider.value) / 100);
		this.setFullscreen(false);

		document.addEventListener("fullscreenchange", () => {
			this.setFullscreen(document.fullscreenElement !== null);
		});

		this.volumeIndicator.addEventListener("click", () => {
			this.setMuted(!this.volumeIndicator.classList.contains("icon-mute"));
		});
		this.volumeSlider.addEventListener("input", () => {
			const inputRange = this.volumeSlider as any;

			this.controlContainer.style.setProperty('--volume-before-width', inputRange.value / inputRange.max * 100 + '%');
		});
		this.raiseHandButton.addEventListener("click", () => {
			this.setSelected(this.raiseHandButton, !this.raiseHandButton.classList.contains("selected"));
		});
		this.showQuizButton.addEventListener("click", () => {
			this.setSelected(this.showQuizButton, !this.showQuizButton.classList.contains("selected"));
		});
	}

	get visible(): boolean {
		return this.hasAttribute("visible");
	}

	set visible(value: boolean) {
		if (value) {
			this.setAttribute("visible", "");
		}
		else {
			this.removeAttribute("visible");
		}
	}

	show(): void {
		this.visible = true;
	}

	hide(): void {
		this.visible = false;
	}

	setDuration(durationMs: number): void {
		const date = new Date(durationMs);
		const hours = date.getUTCHours();
		const minutes = "0" + date.getUTCMinutes();
		const seconds = "0" + date.getUTCSeconds();

		const formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);

		this.duration.innerText = formattedTime;
	}

	setVolume(volume: number): void {
		this.volumeSlider.value = (volume * 100).toString();

		this.updateVolumeIndicator(volume);
	}

	setMuted(muted: boolean): void {
		if (muted) {
			this.setVolumeIndicator("icon-mute");
		}
		else {
			this.updateVolumeIndicator(parseFloat(this.volumeSlider.value) / 100);
		}

		if (this.muteObserver) {
			this.muteObserver(muted);
		}
	}

	setFullscreen(fullscreen: boolean): void {
		if (fullscreen) {
			this.setFullscreenIndicator("bi-fullscreen-exit");
		}
		else {
			this.setFullscreenIndicator("bi-fullscreen");
		}
	}

	setSelected(button: HTMLButtonElement, selected: boolean): void {
		const classList = button.classList;

		if (selected) {
			classList.add("selected");
		}
		else {
			classList.remove("selected");
		}
	}

	setActive(button: HTMLButtonElement, active: boolean): void {
		const classList = button.classList;

		if (active) {
			classList.add("active");
		}
		else {
			classList.remove("active");
		}
	}

	setVisible(button: HTMLButtonElement, visible: boolean): void {
		if (visible) {
			button.classList.remove("invisible");
		}
		else {
			button.classList.add("invisible");
		}
	}

	setPlayMediaVisible(visible: boolean): void {
		this.setVisible(this.playMediaButton, visible);
		this.toggleClass(this.playMediaButton, visible, "pulse-infinite");
	}

	setOnPlayMedia(observer: Observer<void>): void {
		this.playMediaButton.addEventListener("click", () => {
			event.stopPropagation();
			observer();
		}, false);
	}

	setOnVolume(observer: Observer<number>): void {
		this.volumeSlider.addEventListener("input", () => {
			const volume = parseFloat(this.volumeSlider.value) / 100;

			this.updateVolumeIndicator(volume);

			observer(volume);
		});
	}

	setOnMute(observer: Observer<boolean>): void {
		this.muteObserver = observer;
	}

	setOnSettings(observer: Observer<boolean>): void {
		this.settingsButton.addEventListener("click", () => {
			event.stopPropagation();
			observer(true);
		}, false);
	}

	setOnFullscreen(observer: Observer<boolean>): void {
		this.fullscreenButton.addEventListener("click", () => {
			event.stopPropagation();
			observer(!(document.fullscreenElement));
		}, false);
	}

	setOnRaiseHand(property: Property<boolean>): void {
		property.subscribe(raise => {
			this.setSelected(this.raiseHandButton, raise);
		});

		this.raiseHandButton.addEventListener("click", () => {
			event.stopPropagation();
			property.value = this.raiseHandButton.classList.contains("selected");
		}, false);
	}

	setOnRaiseHandActive(property: Property<boolean>): void {
		property.subscribe(active => {
			this.setActive(this.raiseHandButton, active);
		});
	}

	setOnShowQuiz(property: Property<boolean>): void {
		property.subscribe(show => {
			this.setSelected(this.showQuizButton, show);
		});

		this.showQuizButton.addEventListener("click", () => {
			event.stopPropagation();
			property.value = this.showQuizButton.classList.contains("selected");
		}, false);
	}

	setOnShowQuizActive(property: Property<boolean>): void {
		this.setVisible(this.showQuizButton, property.value);
		this.toggleClass(this.showQuizButton, property.value, "pulse");

		property.subscribe(active => {
			this.setVisible(this.showQuizButton, active);
			this.toggleClass(this.showQuizButton, active, "pulse");
		});
	}

	setChatEnabled(enabled: boolean): void {
		this.setVisible(this.chatButton, enabled);
	}

	setOnChatAction(property: Property<boolean>): void {
		this.setActive(this.chatButton, property.value);

		property.subscribe(show => {
			this.setActive(this.chatButton, show);
		});

		this.chatButton.addEventListener("click", () => {
			event.stopPropagation();
			property.value = this.chatButton.classList.contains("active");
		}, false);
	}

	private toggleClass(button: HTMLElement, add: boolean, name: string) {
		const classList = button.classList;

		if (add) {
			classList.add(name);
		}
		else {
			classList.remove(name);
		}
	}

	private updateVolumeIndicator(volume: number) {
		if (volume === 0) {
			this.setVolumeIndicator("icon-volume0");
		}
		else if (volume < 0.33) {
			this.setVolumeIndicator("icon-volume1");
		}
		else if (volume > 0.33 && volume < 0.66) {
			this.setVolumeIndicator("icon-volume2");
		}
		else if (volume > 0.66) {
			this.setVolumeIndicator("icon-volume3");
		}
	}

	private setFullscreenIndicator(indicatorName: string): void {
		const classList = this.fullscreenButton.classList;

		classList.remove("bi-fullscreen", "bi-fullscreen-exit");
		classList.add(indicatorName);
	}

	private setVolumeIndicator(indicatorName: string): void {
		const classList = this.volumeIndicator.classList;

		classList.remove("icon-mute");

		for (let i = 0; i < 4; i++) {
			classList.remove("icon-volume" + i);
		}

		classList.add(indicatorName);
	}
}

export { WebPlayerControls };