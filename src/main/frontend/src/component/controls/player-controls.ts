import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from "lit/directives/when.js";
import { PrivilegeService } from '../../service/privilege.service';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerControlsStyles } from './player-controls.styles';
import { course } from '../../model/course';
import { State } from '../../utils/state';
import $presentationStore, { ContentFocus } from "../../model/presentation-store";
import $deviceSettingsStore from "../../model/device-settings-store";

@customElement('player-controls')
export class PlayerControls extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerControlsStyles,
	];

	@query('.slide-canvas')
	slideCanvas: HTMLCanvasElement;

	@query('.action-canvas')
	actionCanvas: HTMLCanvasElement;

	@query('.volatile-canvas')
	volatileCanvas: HTMLCanvasElement;

	@query('.text-layer')
	textLayer: HTMLElement;

	@property({ type: Number, reflect: true, attribute: false })
	duration: number;

	@property({ type: Boolean, reflect: true })
	hasQuiz: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasChat: boolean = false;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasParticipants: boolean = false;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	fullscreen: boolean = false;

	@property({ type: Boolean, reflect: true })
	handUp: boolean = false;

	@property({ type: Boolean, reflect: true })
	mutedMic: boolean = false;

	@property({ type: Boolean, reflect: true })
	mutedCam: boolean = false;

	@property({ type: Boolean, reflect: true })
	shareScreen: boolean = false;

	@property({ type: Boolean, reflect: true })
	isConference: boolean = false;

	@property({ type: Boolean, reflect: true })
	shareScreenBlocked: boolean = false;


	override connectedCallback() {
		super.connectedCallback()

		course.addEventListener("course-chat-feature", this.onChatState.bind(this));
		course.addEventListener("course-quiz-feature", this.onQuizState.bind(this));
		course.addEventListener("course-user-privileges", () => {
			this.hasParticipants = PrivilegeService.canViewParticipants();
		});

		const deviceSettings = $deviceSettingsStore.getState();

		this.mutedCam = deviceSettings.cameraMuteOnEntry;
		this.mutedMic = deviceSettings.microphoneMuteOnEntry;
		this.hasChat = course.chatFeature != null && course.chatFeature.featureId != null;
		this.hasQuiz = course.quizFeature != null && course.quizFeature.featureId != null;

		$presentationStore.updates.watch(state => {
			this.requestUpdate();
		});
	}

	protected firstUpdated(): void {
		// Observe fullscreen change by, e.g. escape-key.
		document.addEventListener("fullscreenchange", () => {
			this.fullscreen = document.fullscreenElement !== null;
		});
		document.addEventListener("speech-canceled", (e: CustomEvent) => {
			this.handUp = false;
		});
		document.addEventListener("participant-screen-stream", (e: CustomEvent) => {
			this.shareScreen = e.detail.state === State.CONNECTED;
		});
		document.addEventListener("lect-screen-share-not-allowed", () => {
			this.shareScreen = false;
		});
		document.addEventListener("lect-camera-not-allowed", () => {
			this.mutedCam = true;
		});
		document.addEventListener("lect-camera-not-readable", () => {
			this.mutedCam = true;
		});
		document.addEventListener("lect-camera-not-readable", () => {
			this.mutedCam = true;
		});
		document.addEventListener("screen-share-block", (e: CustomEvent) => {
			this.shareScreenBlocked = e.detail.screenSharing;
		});
	}

	private onMuteMicrophone(): void {
		this.mutedMic = !this.mutedMic;
	}

	private onMuteCamera(): void {
		this.mutedCam = !this.mutedCam;
	}

	private onShareScreen(): void {
		this.shareScreen = !this.shareScreen;

		this.dispatchEvent(Utils.createEvent("lect-share-screen", {
			shareScreen: this.shareScreen
		}));
	}

	private onHand(): void {
		this.handUp = !this.handUp;

		this.dispatchEvent(Utils.createEvent("player-hand-action", {
			handUp: this.handUp
		}));
	}

	private onChatState() {
		this.hasChat = course.chatFeature != null && course.chatFeature.featureId != null;
		this.requestUpdate();
	}

	private onQuizState() {
		this.hasQuiz = course.quizFeature != null && course.quizFeature.featureId != null;
		this.requestUpdate();
	}

	private onQuiz(): void {
		this.dispatchEvent(Utils.createEvent("player-quiz-action"));
	}

	private onChatVisibility(): void {
		this.dispatchEvent(Utils.createEvent("player-chat-visibility", {
			visible: this.chatVisible
		}));
	}

	private onParticipantsVisibility(): void {
		this.dispatchEvent(Utils.createEvent("player-participants-visibility"));
	}

	private onFullscreen(): void {
		this.fullscreen = !this.fullscreen;

		this.dispatchEvent(Utils.createEvent("player-fullscreen", {
			fullscreen: this.fullscreen
		}));
	}

	private onSettings(): void {
		this.dispatchEvent(Utils.createEvent("player-settings"));
	}

	private getFormattedDuration(): string {
		if (!this.duration) {
			return "";
		}

		const date = new Date(this.duration);
		const hours = date.getUTCHours();
		const minutes = "0" + date.getUTCMinutes();
		const seconds = "0" + date.getUTCSeconds();

		return hours + ":" + minutes.slice(-2) + ":" + seconds.slice(-2);
	}

	render() {
		const documentsEnabled = $presentationStore.getState().contentFocus !== ContentFocus.ScreenShare;

		return html`
			<div class="col nav-left">
				<media-device-button
					class="conference-control"
					type="audio"
					@lect-device-mute="${this.onMuteMicrophone}"
					.muted="${this.mutedMic}"
					.tooltip="${this.mutedMic ? t("controls.mic.unmute") : t("controls.mic.mute")}"
				>
					<sl-icon slot="icon" library="lect-icons" name="microphone" id="microphone"></sl-icon>
					<sl-icon slot="icon" library="lect-icons" name="microphone-mute" id="microphone-mute"></sl-icon>
				</media-device-button>

				<media-device-button
					class="conference-control"
					type="video"
					@lect-device-mute="${this.onMuteCamera}"
					.muted="${this.mutedCam}"
					.tooltip="${this.mutedCam ? t("controls.cam.unmute") : t("controls.cam.mute")}"
				>
					<sl-icon slot="icon" library="lect-icons" name="camera" id="camera"></sl-icon>
					<sl-icon slot="icon" library="lect-icons" name="camera-mute" id="camera-mute"></sl-icon>
				</media-device-button>

				<audio-volume-button></audio-volume-button>

				<span id="duration">${this.getFormattedDuration()}</span>
			</div>
			<div class="col nav-center">
				${when(PrivilegeService.canContributeBySpeech(), () => html`
				<sl-tooltip content="${this.handUp ? t("controls.speech.abort") : t("controls.speech.start")}" trigger="hover">
					<sl-button @click="${this.onHand}" id="hand-button">
						<sl-icon slot="prefix" library="lect-icons" name="hand"></sl-icon>
					</sl-button>
				</sl-tooltip>
				`)}

				${when(PrivilegeService.canParticipateInQuiz(), () => html`
				<sl-tooltip content="${t("controls.quiz.show")}" trigger="hover">
					<sl-button @click="${this.onQuiz}" id="quiz-button">
						<sl-icon slot="prefix" library="lect-icons" name="quiz"></sl-icon>
					</sl-button>
				</sl-tooltip>
				`)}

				${when(PrivilegeService.canShareScreen(), () => html`
				<sl-tooltip content="${t(this.shareScreen ? "controls.screenshare.stop" : "controls.screenshare")}" trigger="hover">
					<sl-button @click="${this.onShareScreen}" class="conference-control" id="share-screen-button">
						<sl-icon slot="prefix" library="lect-icons" name="share-screen"></sl-icon>
					</sl-button>
				</sl-tooltip>
				`)}

				${when(PrivilegeService.canShareDocuments(), () => html`
				<documents-button .disabled="${!documentsEnabled}" class="conference-control"></documents-button>
				`)}
			</div>
			<div class="col nav-right">
				<layout-button class="conference-control"></layout-button>

				<sl-tooltip content="${t(this.participantsVisible ? "controls.participants.hide" : "controls.participants.show")}" trigger="hover">
					<sl-button @click="${this.onParticipantsVisibility}" id="participants-button">
						<sl-icon slot="prefix" library="lect-icons" name="participants"></sl-icon>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${this.chatVisible ? t("controls.chat.hide") : t("controls.chat.show")}" trigger="hover">
					<sl-button @click="${this.onChatVisibility}" id="chat-button">
						<sl-icon slot="prefix" library="lect-icons" name="chat"></sl-icon>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}" trigger="hover">
					<sl-button @click="${this.onFullscreen}" id="fullscreen-button">
						<sl-icon slot="prefix" library="lect-icons" name="fullscreen" id="fullscreen"></sl-icon>
						<sl-icon slot="prefix" library="lect-icons" name="fullscreen-exit" id="fullscreen-exit"></sl-icon>
					</sl-button>
				</sl-tooltip>
			</div>
		`;
	}
}