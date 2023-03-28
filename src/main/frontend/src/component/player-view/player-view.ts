import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement, t } from '../i18n-mixin';
import { ParticipantView } from '../participant-view/participant-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { course } from '../../model/course';
import { ScreenView } from '../screen-view/screen-view';
import { State } from '../../utils/state';
import { ConferenceView } from '../conference-view/conference-view';
import { SlSplitPanel } from '@shoelace-style/shoelace';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	chatVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	rightContainerVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	screenVisible: boolean = false;

	@query("player-controls")
	controls: PlayerControls;

	@query(".video-feeds")
	videoFeedContainer: HTMLElement;

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


	getController(): PlayerViewController {
		return this.controller;
	}

	addParticipant(view: ParticipantView) {
		if (course.conference) {
			this.conferenceView.addGridElement(view);
		}
		else {
			view.addEventListener("participant-state", this.onParticipantState.bind(this));
			view.addEventListener("participant-screen-stream", this.onParticipantScreenStream.bind(this));
			view.addEventListener("participant-screen-visibility", this.onParticipantScreenVisibility.bind(this));

			this.videoFeedContainer.appendChild(view);
		}
	}

	removeParticipant(view: ParticipantView) {
		if (this.videoFeedContainer.contains(view)) {
			this.videoFeedContainer.removeChild(view);
		}
	}

	cleanup() {
		// Reset controls.
		this.controls.handUp = false;
		this.controls.fullscreen = false;

		// Cleanup screen view.
		this.screenVisible = false;
		this.screenView.removeVideo();
		this.screenView.setState(State.DISCONNECTED);

		// Cleanup video feeds.
		while (this.videoFeedContainer.firstChild) {
			this.videoFeedContainer.removeChild(this.videoFeedContainer.firstChild);
		}
	}

	override connectedCallback() {
		super.connectedCallback()

		course.addEventListener("course-user-privileges", () => {
			this.updateContainerVisibility();
		});

		this.addEventListener("screen-view-video", (event: CustomEvent) => {
			this.screenVisible = event.detail.hasVideo;
		});
		this.addEventListener("player-chat-visibility", (event: CustomEvent) => {
			this.chatVisible = event.detail.visible;
			this.updateContainerVisibility();
		});
	}

	protected render() {
		if (!course.courseId) {
			// Course not loaded, nothing to show.
			return null;
		}

		return html`
			<sl-split-panel position="0" id="outer-split-panel">
				<div slot="start" class="left-container">
					<div class="feature-container">
						${when(PrivilegeService.canViewParticipants(), () => html`
							<participants-box></participants-box>
						`)}
					</div>
				</div>
				<div slot="end">
					<sl-split-panel position="100" id="inner-split-panel">
						<div slot="start" class="center-container">
							${when(course.conference,
								() => html`
								<div class="conference-container">
									<conference-view></conference-view>
								</div>
								`,
								() => html`
								<div class="slide-container">
									<slide-view class="slides"></slide-view>
									<screen-view></screen-view>
								</div>
								`)
							}
							<div class="controls-container">
								<player-controls .chatVisible="${this.chatVisible}" .participantsVisible="${this.participantsVisible}"></player-controls>
							</div>
						</div>
						<div slot="end" class="right-container">
							<div class="video-feeds">
							</div>
							<div class="feature-container">
								${when(PrivilegeService.canUseChat(), () => html`
								<chat-box .messageService="${this.messageService}"></chat-box>
								`)}
							</div>
						</div>
					</sl-split-panel>
				</div>
			</sl-split-panel>
		`;
	}

	private updateContainerVisibility() {
		this.rightContainerVisible = this.chatVisible && PrivilegeService.canUseChat();
		this.participantsVisible = PrivilegeService.canViewParticipants();
	}

	private onParticipantState(event: CustomEvent) {
		this.screenView.setState(event.detail.state);
	}

	private onParticipantScreenStream(event: CustomEvent) {
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.screenView.addVideo(event.detail.video);
		}
		else if (state === State.DISCONNECTED) {
			this.screenView.removeVideo();
		}
	}

	private onParticipantScreenVisibility(event: CustomEvent) {
		const visible: boolean = event.detail.visible;

		this.screenView.setVideoVisible(visible);
	}
}
