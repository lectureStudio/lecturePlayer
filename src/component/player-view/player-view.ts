import { html } from 'lit';
import { when } from 'lit/directives/when.js';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, query } from 'lit/decorators.js';
import { MessageService } from '../../service/message.service';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement } from '../i18n-mixin';
import { ParticipantView } from '../participant-view/participant-view';
import { PlayerViewController } from './player-view.controller';
import { ScreenView } from '../screen-view/screen-view';
import { autorun } from 'mobx';
import { privilegeStore } from '../../store/privilege.store';
import { courseStore } from '../../store/course.store';
import { SlSplitPanel } from '@shoelace-style/shoelace';
import { ConferenceView } from '../conference-view/conference-view';
import { uiStateStore } from '../../store/ui-state.store';
import { PlayerController } from '../player/player.controller';
import { participantStore } from '../../store/participants.store';
import { Component } from '../component';
import playerViewStyles from './player-view.scss';

@customElement('player-view')
export class PlayerView extends Component {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	playerController: PlayerController;

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	screenVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	rightContainerVisible: boolean = false;

	@query("player-controls")
	controls: PlayerControls;

	@query("screen-view")
	screenView: ScreenView;

	@query("conference-view")
	conferenceView: ConferenceView;

	@query(".video-conference")
	videoConferenceContainer: HTMLElement;

	@query("#inner-split-panel")
	innterSplitPanel: SlSplitPanel;

	@query("#outer-split-panel")
	outerSplitPanel: SlSplitPanel;


	addParticipant(view: ParticipantView) {
		if (courseStore.conference) {
			this.conferenceView.addGridElement(view);
		}
	}

	cleanup() {
		// Reset controls.
		this.controls.handUp = false;
		this.controls.fullscreen = false;

		// Cleanup screen view.
		this.screenVisible = false;
	}

	override connectedCallback() {
		super.connectedCallback()

		autorun(() => {
			this.participantsVisible = privilegeStore.canViewParticipants() && uiStateStore.participantsVisible;
		});
		autorun(() => {
			this.rightContainerVisible = uiStateStore.rightContainerVisible;
		});
		autorun(() => {
			this.chatVisible = uiStateStore.chatVisible;
		});
	}

	protected override firstUpdated() {
		this.playerController.setPlayerViewController(this.controller);
	}

	protected render() {
		if (!courseStore.courseId) {
			// Course not loaded, nothing to show.
			return null;
		}

		this.screenVisible = participantStore.hasScreenStream();

		return html`
			<sl-split-panel position="0" id="outer-split-panel">
				<div slot="start" class="left-container">
					<div class="feature-container">
						${when(privilegeStore.canViewParticipants(), () => html`
							<participant-list></participant-list>
						`)}
					</div>
				</div>
				<div slot="end">
					<sl-split-panel position="100" id="inner-split-panel">
						<div slot="start" class="center-container">
							${when(courseStore.conference,
								() => html`
								<div class="conference-container">
									<conference-view></conference-view>
								</div>
								`,
								() => html`
								<div class="slide-container">
									<slide-view class="slides" .playerController="${this.playerController}"></slide-view>
									${when(this.screenVisible, () => html`
									<screen-view .participant="${participantStore.getWithScreenStream()}"></screen-view>
									`)}
								</div>
								`)
							}
							<div class="controls-container">
								<player-controls .chatVisible="${this.chatVisible}" .participantsVisible="${this.participantsVisible}"></player-controls>
							</div>
						</div>
						<div slot="end" class="right-container">
							<div class="video-feeds">
							${repeat(participantStore.getWithStream(), (participant) => participant.userId, (participant, index) => html`
								<participant-view .participant="${participant}"></participant-view>
							`)}
							</div>
							<div class="feature-container">
								${when(privilegeStore.canUseChat(), () => html`
								<chat-box .messageService="${this.messageService}"></chat-box>
								`)}
							</div>
						</div>
					</sl-split-panel>
				</div>
			</sl-split-panel>
		`;
	}
}
