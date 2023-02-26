import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PrivilegeService } from '../../service/privilege.service';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerControlsStyles } from './player-controls.styles';
import { course } from '../../model/course';
import { SlTooltip } from '@shoelace-style/shoelace';

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

	@query('.text-layer')
	textLayer: HTMLElement;

	@query('#volume-tooltip')
	volumeTooltip: SlTooltip;

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
	}

	private onMuteMicrophone(): void {
		this.mutedMic = !this.mutedMic;
	}

	private onMuteCamera(): void {
		this.mutedCam = !this.mutedCam;
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

	private onVolume(): void {
		this.volumeTooltip.hide();
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

				<sl-tooltip content="${t("controls.volume")}" id="volume-tooltip">
					<audio-volume-button @click="${this.onVolume}"></audio-volume-button>
				</sl-tooltip>

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