import { CSSResultGroup, html } from 'lit';
import { when } from 'lit/directives/when.js';
import { autorun } from 'mobx';
import { customElement, property, query } from 'lit/decorators.js';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { featureStore } from '../../store/feature.store';
import { privilegeStore } from '../../store/privilege.store';
import { deviceStore } from '../../store/device.store';
import { EventEmitter } from '../../utils/event-emitter';
import { Component } from '../component';
import playerControlsStyles from './player-controls.css';

@customElement('player-controls')
export class PlayerControls extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		playerControlsStyles,
	];

	readonly eventEmitter: EventEmitter;

	@query('#volumeIndicator')
	accessor volumeIndicator: HTMLElement;

	@query('.text-layer')
	accessor textLayer: HTMLElement;

	@property({ type: Number })
	accessor duration: number;

	@property({ type: Boolean, reflect: true })
	accessor hasQuiz: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor hasChat: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor chatVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor hasParticipants: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor participantsVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor fullscreen: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor handUp: boolean = false;


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

	protected override firstUpdated(): void {
		// Observe fullscreen change by, e.g. escape-key.
		document.addEventListener("fullscreenchange", () => {
			this.fullscreen = document.fullscreenElement !== null;
		});
		this.eventEmitter.addEventListener("lp-speech-canceled", () => {
			this.handUp = false;
		});
	}

	private onHand(): void {
		this.handUp = !this.handUp;

		this.eventEmitter.dispatchEvent(Utils.createEvent<boolean>("lp-speech-request", this.handUp));
	}

	private onQuiz(): void {
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-quiz-visibility"));
	}

	private onChatVisibility(): void {
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-chat-visibility"));
	}

	private onParticipantsVisibility(): void {
		this.eventEmitter.dispatchEvent(Utils.createEvent<void>("lp-participants-visibility"));
	}

	private onFullscreen(): void {
		this.fullscreen = !this.fullscreen;

		this.eventEmitter.dispatchEvent(Utils.createEvent<boolean>("lp-fullscreen", this.fullscreen));
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

	override render() {
		return html`
			<div class="col nav-left">
				${when(deviceStore.canSetSpeakerVolume, () => html`
					<audio-volume-button></audio-volume-button>
				`)}

				<span class="course-duration">${this.getFormattedDuration()}</span>
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

				${when(this.requestFullscreen, () => html`
					<sl-tooltip content="${this.fullscreen ? t("controls.fullscreen.off") : t("controls.fullscreen.on")}" trigger="hover">
						<sl-button @click="${this.onFullscreen}" id="fullscreen-button">
							<sl-icon slot="prefix" name="fullscreen" id="fullscreen"></sl-icon>
							<sl-icon slot="prefix" name="fullscreen-exit" id="fullscreen-exit"></sl-icon>
						</sl-button>
					</sl-tooltip>
				`)}

				<settings-button .eventEmitter="${this.eventEmitter}"></settings-button>
			</div>
		`;
	}
}
