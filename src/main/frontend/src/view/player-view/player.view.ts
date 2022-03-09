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

	private playerContainer: HTMLElement;

	private slideView: WebSlideView;

	private playerControls: WebPlayerControls;

	private videoFeed: HTMLMediaElement;

	private videoFeedContainer: HTMLElement;

	private mainVideoFeedContainer: HTMLElement;

	private localVideoFeedContainer: HTMLElement;

	private chatContainer: HTMLElement;

	private chatModal: any;

	private chatModalState: boolean;

	private chatCollapse: any;

	private rightContainer: HTMLElement;


	constructor(model: PlaybackModel) {
		super();

		this.playbackModel = model;
		this.chatCollapse = null;
		this.chatModal = null;
		this.chatModalState = false;
	}

	connectedCallback() {
		const elementA = this.playbackModel.elementAProperty.value;

		if (elementA) {
			this.setChat(elementA);
		}

		this.videoFeed.addEventListener("canplay", () => {
			this.videoFeed.play()
				.catch(error => {
					if (error.name == "NotAllowedError") {
						this.cannotPlay();
					}
				});
		});
		this.videoFeed.addEventListener("play", () => {
			// window.dispatchEvent(new Event("resize"));
		});

		this.playbackModel.elementAProperty.subscribe(this.setChat.bind(this));
		// this.playbackModel.videoAvailableProperty.subscribe(this.setVideoAvailable.bind(this));
		this.playbackModel.mainVideoAvailableProperty.subscribe(this.setMainVideoAvailable.bind(this));
		this.playbackModel.localVideoAvailableProperty.subscribe(this.setLocalVideoAvailable.bind(this));

		this.playbackModel.showChatProperty.subscribe(this.showChat.bind(this));

		this.playerControls.setOnRaiseHand(this.playbackModel.raisedHandProperty);
		this.playerControls.setOnRaiseHandActive(this.playbackModel.webrtcPublisherConnectedProperty);
		this.playerControls.setOnShowQuiz(this.playbackModel.showQuizProperty);
		this.playerControls.setOnShowQuizActive(this.playbackModel.showQuizActiveProperty);
		this.playerControls.setOnChatAction(this.playbackModel.showChatProperty);
		this.playerControls.setOnFullscreen((fullscreen: boolean) => {
			this.setFullscreen(fullscreen);
		});
		this.playerControls.setOnPlayMedia(() => {
			this.videoFeed.play()
				.then(() => {
					this.playerControls.setPlayMediaVisible(false);

					const videos = this.querySelectorAll("video");
					videos.forEach(function (video) {
						video.play();
					});
				})
				.catch(error => {
					console.error(error);
				});
		});

		const chatModalElement = document.getElementById("chatModal");
		chatModalElement.addEventListener("hidden.bs.modal", (e: any) => {
			this.playbackModel.showChat = false;
		});

		this.chatModal = new bootstrap.Modal(chatModalElement, {});

		const mql = window.matchMedia("(max-width: 576px)");
		mql.addEventListener('change', (e: MediaQueryListEvent) => {
			this.chatModalState = e.matches;
			this.playbackModel.showChat = !mql.matches;
		});

		this.chatModalState = mql.matches;
		this.playbackModel.showChat = !mql.matches;

		new ResizeObserver(this.computeViewSize.bind(this)).observe(this.playerContainer);

		this.style.display = "none";
	}

	show() {
		this.style.display = "flex";
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
			if (this.requestFullscreen) {
				this.requestFullscreen();
			}
		}
		else {
			if (document.exitFullscreen) {
				document.exitFullscreen();
			}
		}

		this.computeViewSize();
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

		// window.dispatchEvent(new Event("resize"));
	}

	private setChat(element: HTMLElement): void {
		if (element) {
			this.chatContainer.appendChild(element);

			const chatCloseButton = element.querySelector("#chat-close-button");
			chatCloseButton.addEventListener("click", this.toggleChat.bind(this));

			const chatCollapseElement = element.querySelector("#flush-chat");
			this.chatCollapse = new bootstrap.Collapse(chatCollapseElement, {
				toggle: false
			});

			const clone = element.cloneNode(true) as HTMLElement;
			const messageForm = clone.querySelector("#course-message-form") as HTMLFormElement;

			const chatModalElement = document.getElementById("chatModal");
			const chatModalContent = chatModalElement.querySelector(".modal-body");
			chatModalContent.appendChild(messageForm);

			const submitButton = chatModalContent.querySelector("#messageSubmit");

			const chatModalFooter = chatModalElement.querySelector(".modal-footer");
			chatModalFooter.appendChild(submitButton);

			submitButton.addEventListener("click", (event) => {
				// Disable default action.
				event.preventDefault();

				const data = new FormData(messageForm);
				const value = Object.fromEntries(data.entries());

				fetch(messageForm.getAttribute("action"), {
					method: "POST",
					body: JSON.stringify(value),
					headers: {
						"Content-Type": "application/json"
					}
				})
				.then(response => {
					const toastId = (response.status === 200) ? "toast-success" : "toast-warn";
					const toastMessage = (response.status === 200) ? "course.feature.message.sent" : "course.feature.message.send.error";
	
					this.showToast(toastId, toastMessage);
	
					messageForm.reset();

					this.chatModal.hide();
				})
				.catch(error => console.error(error));
			});

			this.playbackModel.showChat = !window.matchMedia("(max-width: 768px)").matches;
		}
		else {
			while (this.chatContainer.firstElementChild) {
				const chatCloseButton = this.chatContainer.firstElementChild.querySelector("#chat-close-button");
				chatCloseButton.removeEventListener("click", this.toggleChat);

				if (this.chatCollapse) {
					this.chatCollapse.dispose();
					this.chatCollapse = null;
				}

				const chatModalElement = document.getElementById("chatModal");
				const chatModalContent = chatModalElement.querySelector(".modal-body");
				const chatModalFooter = chatModalElement.querySelector(".modal-footer");
				const submitButton = chatModalFooter.querySelector("#messageSubmit");

				chatModalFooter.removeChild(submitButton);

				this.removeAllChildNodes(chatModalContent);

				this.chatContainer.removeChild(this.chatContainer.firstElementChild);
			}
		}

		this.playerControls.setChatEnabled(element !== null);

		this.updateRightContainer();
	}

	private showChat(show: boolean): void {
		const chat = this.chatContainer.firstElementChild as HTMLElement;

		if (chat === null) {
			return;
		}
		if (show && this.chatModalState) {
			this.chatModal.show();
		}

		this.setElementVisible(chat, show);

		if (show) {
			this.chatCollapse.show();
		}
	}

	private toggleChat() {
		const enabled = this.playbackModel.showChat;

		this.playbackModel.showChat = !enabled;
	}

	private showToast(toastId: string, messageId: string) {
		const toastElement = document.getElementById(toastId);
		const toastBody = toastElement.getElementsByClassName("toast-body")[0];
		toastBody.innerHTML = window.dict[messageId];

		const toast = new bootstrap.Toast(toastElement);
		toast.show();
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
			|| this.playbackModel.localVideoAvailable || this.chatContainer.hasChildNodes());

		this.computeViewSize();
	}

	private computeViewSize() {
		const slideRatio = 4 / 3;
		let width = this.offsetWidth - this.rightContainer.offsetWidth;
		let height = this.offsetHeight;
		const viewRatio = width / height;

		if (viewRatio > slideRatio) {
			width = height * slideRatio;
		}
		else {
			height = width / slideRatio;
		}

		this.playerContainer.style.height = ((height + this.playerControls.offsetHeight) / this.offsetHeight * 100) + "%";
	}

	private removeAllChildNodes(parent: Element) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	}
}

export { PlayerView };