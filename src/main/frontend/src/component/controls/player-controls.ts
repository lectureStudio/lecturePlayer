import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { PrivilegeService } from '../../service/privilege.service';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerControlsStyles } from './player-controls.styles';
import { course } from '../../model/course';
import { SlTooltip } from '@shoelace-style/shoelace';
import { Settings } from '../../utils/settings';

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

		this.mutedCam = Settings.getCameraMuteOnEntry();
		this.mutedMic = Settings.getMicrophoneMuteOnEntry();
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
					<sl-button @click="${this.onHand}" class="icon-speech" id="hand-button">
						<span slot="prefix" class="icon-speech"></span>
					</sl-button>
				</sl-tooltip>
				` : ''}

				${this.privilegeService.canParticipateInQuiz() ? html`
				<sl-tooltip content="${t("controls.quiz.show")}">
					<sl-button @click="${this.onQuiz}" id="quiz-button">
						<span slot="prefix" class="icon-quiz"></span>
					</sl-button>
				</sl-tooltip>
				` : ''}

				<sl-tooltip content="${t("controls.screenshare")}">
					<sl-button class="conference-control">
						<span slot="prefix" class="icon-share"></span>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${t("controls.documents")}">
					<sl-button class="conference-control">
						<span slot="prefix" class="icon-collection"></span>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${t("controls.tools")}">
					<sl-button class="conference-control">
						<span slot="prefix" class="icon-pen"></span>
					</sl-button>
				</sl-tooltip>
			</div>
			<div class="col nav-right">
				<sl-tooltip content="${t(this.participantsVisible ? "controls.participants.hide" : "controls.participants.show")}">
					<sl-button @click="${this.onParticipantsVisibility}" id="participants-button">
						<span slot="prefix" class="icon-participants"></span>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${this.chatVisible ? t("controls.chat.hide") : t("controls.chat.show")}">
					<sl-button @click="${this.onChatVisibility}" id="chat-button">
						<span slot="prefix" class="icon-chat"></span>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${t("controls.settings")}">
					<sl-button @click="${this.onSettings}" id="settings-button">
						<span slot="prefix" class="icon-settings"></span>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}">
					<sl-button @click="${this.onFullscreen}" id="fullscreen-button">
						<span slot="prefix" class="icon-fullscreen"></span>
						<span slot="prefix" class="icon-fullscreen-exit"></span>
					</sl-button>
				</sl-tooltip>
			</div>
		`;
	}
}