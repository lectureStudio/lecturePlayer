import { html } from 'lit';
import { autorun } from 'mobx';
import { customElement, property, query } from 'lit/decorators.js';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerControlsStyles } from './player-controls.styles';
import { featureStore } from '../../store/feature.store';
import { privilegeStore } from '../../store/privilege.store';

@customElement('player-controls')
export class PlayerControls extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerControlsStyles,
	];

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


	override connectedCallback() {
		super.connectedCallback()

		autorun(() => {
			this.hasParticipants = privilegeStore.canViewParticipants();
		});

		autorun(() => {
			this.hasChat = featureStore.hasChatFeature();
			this.hasQuiz = featureStore.hasQuizFeature();

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

	private onHand(): void {
		this.handUp = !this.handUp;

		this.dispatchEvent(Utils.createEvent("player-hand-action", {
			handUp: this.handUp
		}));
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
				<button id="volumeIndicator" @click="${this.onMuteAudio}">
					<span class="icon-audio-mute"></span>
					<span class="icon-audio-off"></span>
					<span class="icon-audio-low"></span>
					<span class="icon-audio-up"></span>
					<span class="icon-audio-high"></span>
					<ui-tooltip for="volumeIndicator" .text="${this.mutedVolume ? t("controls.audio.unmute") : t("controls.audio.mute")}"></ui-tooltip>
				</button>
				<input type="range" id="volumeSlider" min="0" max="1" value="1" step="0.01" .value="${this.volume}" @input="${this.onVolume}">
				<span id="duration">${this.getFormattedDuration()}</span>
			</div>
			<div class="col nav-center">
				${privilegeStore.canContributeBySpeech() ? html`
				<button @click="${this.onHand}" class="icon-speech" id="hand-button">
					<ui-tooltip for="hand-button" .text="${this.handUp ? t("controls.speech.abort") : t("controls.speech.start")}"></ui-tooltip>
				</button>
				` : ''}

				${privilegeStore.canParticipateInQuiz() ? html`
				<button @click="${this.onQuiz}" class="icon-quiz" id="quiz-button">
					<ui-tooltip for="quiz-button" .text="${t("controls.quiz.show")}"></ui-tooltip>
				</button>
				` : ''}
			</div>
			<div class="col nav-right">
				<button @click="${this.onParticipantsVisibility}" class="icon-participants" id="participants-button">
					<ui-tooltip for="participants-button" .text="${t(this.participantsVisible ? "controls.participants.hide" : "controls.participants.show")}" sticky="true"></ui-tooltip>
				</button>

				${privilegeStore.canUseChat() ? html`
				<button @click="${this.onChatVisibility}" class="icon-chat" id="chat-button">
					<ui-tooltip for="chat-button" .text="${this.chatVisible ? t("controls.chat.hide") : t("controls.chat.show")}" sticky="true"></ui-tooltip>
				</button>
				` : ''}

				<button @click="${this.onSettings}" class="icon-settings" id="settings-button">
					<ui-tooltip for="settings-button" .text="${t("controls.settings")}"></ui-tooltip>
				</button>
				<button @click="${this.onFullscreen}" id="fullscreen-button">
					<span class="icon-fullscreen"></span>
					<span class="icon-fullscreen-exit"></span>
					<ui-tooltip for="fullscreen-button" .text="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}"></ui-tooltip>
				</button>
			</div>
		`;
	}
}