import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { autorun } from 'mobx';
import { customElement, property, query } from 'lit/decorators.js';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { featureStore } from '../../store/feature.store';
import { privilegeStore } from '../../store/privilege.store';
import playerControlsStyles from './player-controls.scss';

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
				<audio-volume-button></audio-volume-button>

				<span id="duration">${this.getFormattedDuration()}</span>
			</div>
			<div class="col nav-center">
				${when(privilegeStore.canContributeBySpeech(), () => html`
					<sl-tooltip content="${this.handUp ? t("controls.speech.abort") : t("controls.speech.start")}" trigger="hover">
						<sl-button @click="${this.onHand}" id="hand-button">
							<sl-icon slot="prefix" name="hand"></sl-icon>
						</sl-button>
					</sl-tooltip>
				`)}

				${when(privilegeStore.canParticipateInQuiz(), () => html`
					<sl-tooltip content="${t("controls.quiz.show")}" trigger="hover">
						<sl-button @click="${this.onQuiz}" id="quiz-button">
							<sl-icon slot="prefix" name="quiz"></sl-icon>
						</sl-button>
					</sl-tooltip>
				`)}
			</div>
			<div class="col nav-right">
				${when(privilegeStore.canViewParticipants(), () => html`
					<sl-tooltip content="${t(this.participantsVisible ? "controls.participants.hide" : "controls.participants.show")}" trigger="hover">
						<sl-button @click="${this.onParticipantsVisibility}" id="participants-button">
							<sl-icon slot="prefix" name="participants"></sl-icon>
						</sl-button>
					</sl-tooltip>
				`)}

				${when(privilegeStore.canUseChat(), () => html`
					<sl-tooltip content="${this.chatVisible ? t("controls.chat.hide") : t("controls.chat.show")}" trigger="hover">
						<sl-button @click="${this.onChatVisibility}" id="chat-button">
							<sl-icon slot="prefix" name="chat"></sl-icon>
						</sl-button>
					</sl-tooltip>
				`)}

				<sl-tooltip content="${t("controls.settings")}" trigger="hover">
					<sl-button @click="${this.onSettings}" id="settings-button">
						<sl-icon slot="prefix" name="settings"></sl-icon>
					</sl-button>
				</sl-tooltip>

				<sl-tooltip content="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}" trigger="hover">
					<sl-button @click="${this.onFullscreen}" id="fullscreen-button">
						<sl-icon slot="prefix" name="fullscreen" id="fullscreen"></sl-icon>
						<sl-icon slot="prefix" name="fullscreen-exit" id="fullscreen-exit"></sl-icon>
					</sl-button>
				</sl-tooltip>
			</div>
		`;
	}
}