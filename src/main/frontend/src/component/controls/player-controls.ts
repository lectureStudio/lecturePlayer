import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PrivilegeService } from '../../service/privilege.service';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerControlsStyles } from './player-controls.styles';
import { course } from '../../model/course';

@customElement('player-controls')
export class PlayerControls extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerControlsStyles,
	];

	@property()
	privilegeService: PrivilegeService;

	@query('.slide-canvas')
	slideCanvas: HTMLCanvasElement;

	@query('.action-canvas')
	actionCanvas: HTMLCanvasElement;

	@query('.volatile-canvas')
	volatileCanvas: HTMLCanvasElement;

	@query('#volumeIndicator')
	volumeIndicator: HTMLElement;

	@query('.text-layer')
	textLayer: HTMLElement;

	@property({ type: Number, reflect: true })
	volume: number = 1;

	mutedVolume: number = null;

	@property({ type: Number, reflect: true })
	volumeState: number;

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
	isConference: boolean = false;


	override connectedCallback() {
		super.connectedCallback()

		course.addEventListener("course-chat-feature", this.onChatState.bind(this));
		course.addEventListener("course-quiz-feature", this.onQuizState.bind(this));
		course.addEventListener("course-user-privileges", () => {
			this.hasParticipants = this.privilegeService.canViewParticipants();
		});

		this.hasChat = course.chatFeature != null && course.chatFeature.featureId != null;
		this.hasQuiz = course.quizFeature != null && course.quizFeature.featureId != null;

		this.isConference = course.conference;
	}

	protected firstUpdated(): void {
		// Observe fullscreen change by, e.g. escape-key.
		document.addEventListener("fullscreenchange", () => {
			this.fullscreen = document.fullscreenElement !== null;
		});
		document.addEventListener("speech-canceled", (e: CustomEvent) => {
			this.handUp = false;
		});

		this.setVolume(this.volume);
	}

	private setVolume(volume: number) {
		this.volume = volume;

		if (this.volume === 0) {
			this.volumeState = 0;
		}
		else if (this.volume <= 0.1) {
			this.volumeState = 1;
		}
		else if (this.volume <= 0.5) {
			this.volumeState = 2;
		}
		else if (this.volume > 0.5 && this.volume < 0.7) {
			this.volumeState = 3;
		}
		else if (this.volume >= 0.7) {
			this.volumeState = 4;
		}

		this.dispatchEvent(Utils.createEvent("player-volume", {
			volume: this.volume
		}));
	}

	private onMuteAudio(): void {
		if (!this.mutedVolume) {
			this.mutedVolume = this.volume;
			this.setVolume(0);
		}
		else {
			this.setVolume(this.mutedVolume);
			this.mutedVolume = null;
		}		
	}

	private onMuteMicrophone(event: CustomEvent): void {
		this.mutedMic = !this.mutedMic;

		this.dispatchEvent(Utils.createEvent("player-mic", {
			mutedMic: this.mutedMic
		}));
	}

	private onMuteCamera(event: CustomEvent): void {
		this.mutedCam = !this.mutedCam;
		
		this.dispatchEvent(Utils.createEvent("player-cam", {
			mutedCam: this.mutedCam,
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
		this.dispatchEvent(Utils.createEvent("player-chat-visibility"));
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

	private onVolume(e: InputEvent): void {
		this.setVolume(parseFloat((e.target as HTMLInputElement).value));
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
		return html`
			<div class="col nav-left">
				<media-device-button
					class="conference-control"
					type="audio"
					@lect-device-mute="${this.onMuteMicrophone}"
					.muted="${this.mutedMic}"
					.tooltip="${this.mutedMic ? t("controls.mic.unmute") : t("controls.mic.mute")}"
				>
					<span slot="icon" class="icon-mic"></span>
					<span slot="icon" class="icon-mic-muted"></span>
				</media-device-button>

				<media-device-button
					class="conference-control"
					type="video"
					@lect-device-mute="${this.onMuteCamera}"
					.muted="${this.mutedCam}"
					.tooltip="${this.mutedCam ? t("controls.cam.unmute") : t("controls.cam.mute")}"
				>
					<span slot="icon" class="icon-cam"></span>
					<span slot="icon" class="icon-cam-muted"></span>
				</media-device-button>

				<sl-tooltip content="${this.mutedVolume ? t("controls.audio.unmute") : t("controls.audio.mute")}">
					<button id="volumeIndicator" @click="${this.onMuteAudio}">
						<span class="icon-audio-mute"></span>
						<span class="icon-audio-off"></span>
						<span class="icon-audio-low"></span>
						<span class="icon-audio-up"></span>
						<span class="icon-audio-high"></span>
					</button>
				</sl-tooltip>
				<input type="range" id="volumeSlider" min="0" max="1" value="1" step="0.01" .value="${this.volume}" @input="${this.onVolume}">
				<span id="duration">${this.getFormattedDuration()}</span>
			</div>
			<div class="col nav-center">
				${this.privilegeService.canContributeBySpeech() ? html`
				<sl-tooltip content="${this.handUp ? t("controls.speech.abort") : t("controls.speech.start")}">
					<button @click="${this.onHand}" class="icon-speech" id="hand-button"></button>
				</sl-tooltip>
				` : ''}

				${this.privilegeService.canParticipateInQuiz() ? html`
				<sl-tooltip content="${t("controls.quiz.show")}">
					<button @click="${this.onQuiz}" class="icon-quiz" id="quiz-button"></button>
				</sl-tooltip>
				` : ''}

				<sl-tooltip content="Share Screen">
					<button class="icon-share conference-control"></button>
				</sl-tooltip>

				<sl-tooltip content="Documents">
					<button class="icon-collection conference-control"></button>
				</sl-tooltip>

				<sl-tooltip content="Tools">
					<button class="icon-pen conference-control"></button>
				</sl-tooltip>
			</div>
			<div class="col nav-right">
				<sl-tooltip content="${t(this.participantsVisible ? "controls.participants.hide" : "controls.participants.show")}">
					<button @click="${this.onParticipantsVisibility}" class="icon-participants" id="participants-button"></button>
				</sl-tooltip>

				<sl-tooltip content="${this.chatVisible ? t("controls.chat.hide") : t("controls.chat.show")}">
					<button @click="${this.onChatVisibility}" class="icon-chat" id="chat-button"></button>
				</sl-tooltip>

				<sl-tooltip content="${t("controls.settings")}">
					<button @click="${this.onSettings}" class="icon-settings" id="settings-button"></button>
				</sl-tooltip>

				<sl-tooltip content="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}">
					<button @click="${this.onFullscreen}" id="fullscreen-button">
						<span class="icon-fullscreen"></span>
						<span class="icon-fullscreen-exit"></span>
					</button>
				</sl-tooltip>
			</div>
		`;
	}
}