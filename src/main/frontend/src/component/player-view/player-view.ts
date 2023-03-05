import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { PlayerControls } from '../controls/player-controls';
import { I18nLitElement, t } from '../i18n-mixin';
import { ParticipantView } from '../participant-view/participant-view';
import { SlideView } from '../slide-view/slide-view';
import { PlayerViewController } from './player-view.controller';
import { playerViewStyles } from './player-view.styles';
import { course } from '../../model/course';
import { ScreenView } from '../screen-view/screen-view';
import { SlideLayout } from '../../model/slide-layout';
import { State } from '../../utils/state';
import { ConferenceView } from '../conference-view/conference-view';
import { participants } from '../../model/participants';
import { Utils } from '../../utils/utils';
import { GridElement } from '../grid-element/grid-element';
import { SlSplitPanel } from '@shoelace-style/shoelace';
import { RenderController } from '../../render/render-controller';

@customElement('player-view')
export class PlayerView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerViewStyles,
	];

	private controller = new PlayerViewController(this);

	private slideLayout: SlideLayout = SlideLayout.Card;

	@property()
	privilegeService: PrivilegeService;

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

	getSlideView(): SlideView {
		return this.renderRoot.querySelector("slide-view");
	}

	addParticipant(view: ParticipantView, gridElement: GridElement) {
		view.addEventListener("participant-state", this.onParticipantState.bind(this));
		view.addEventListener("participant-screen-stream", this.onParticipantScreenStream.bind(this));
		view.addEventListener("participant-screen-visibility", this.onParticipantScreenVisibility.bind(this));
		view.setVolume(this.controls.volume);

		if (course.conference) {
			this.conferenceView.addGridElement(gridElement);
		}
		else {
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

	protected firstUpdated() {
		//this.controller.getPlayerController().setRenderController(new RenderController(this.getSlideView()));
	}

	protected render() {
		return html`
			<sl-split-panel position="0" id="outer-split-panel">
				<div slot="start" class="left-container">
					<div class="feature-container">
						${this.privilegeService.canViewParticipants() ? html`
						<participants-box .privilegeService="${this.privilegeService}"></participants-box>
						` : ''}
					</div>
					<button @click=${this.addDummyViews}>Add Grid!</button>
					<button @click=${this.addDummyScreen}>Add Screen!</button>
				</div>
				<div slot="end">
					<sl-split-panel position="100" id="inner-split-panel">
						<div slot="start" class="center-container">
							<div class="conference-container">
								<conference-view></conference-view>
							</div>
							<div class="slide-container">
								<slide-view class="slides"></slide-view>
								<screen-view></screen-view>
							</div>
							<div class="controls-container">
								<player-controls .chatVisible="${this.chatVisible}" .participantsVisible="${this.participantsVisible}" .privilegeService="${this.privilegeService}"></player-controls>
							</div>
						</div>
						<div slot="end" class="right-container">
							<div class="video-feeds">
							</div>
							<div class="feature-container">
								${this.privilegeService.canUseChat() ? html`
								<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
								` : ''}
							</div>
						</div>
					</sl-split-panel>
				</div>
			</sl-split-panel>
		`;
	}

	private updateContainerVisibility() {
		this.rightContainerVisible = this.chatVisible && this.privilegeService.canUseChat();
		this.participantsVisible = this.privilegeService.canViewParticipants();
	}

	private addDummyViews() {
		const view: ParticipantView = new ParticipantView;
		view.addVideo
		view.setState(State.CONNECTED);
		view.hasVideo = true;
		view.name = "testname";
		const gridElement: GridElement = new GridElement();
		gridElement.addView(view);
		this.conferenceView.addGridElement(gridElement);
	}

	private addDummyScreen() {
		const view: ParticipantView = new ParticipantView;
		view.addVideo
		view.setState(State.CONNECTED);
		view.hasVideo = true;
		view.name = "speaker";
		const gridElement: GridElement = new GridElement();
		gridElement.addView(view);
		this.conferenceView.addScreenElement(gridElement);
		this.conferenceView.setConferenceLayout("sideRight")
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
