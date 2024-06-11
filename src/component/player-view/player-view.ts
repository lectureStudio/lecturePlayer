import { consume } from "@lit/context";
import { CSSResultGroup, html } from 'lit';
import { when } from 'lit/directives/when.js';
import { repeat } from 'lit/directives/repeat.js';
import { customElement, property, query } from 'lit/decorators.js';
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { CourseContext, courseContext } from "../../context/course.context";
import { MouseListener } from "../../event/mouse-listener";
import { ToolController } from "../../tool/tool-controller";
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
import { participantStore } from '../../store/participants.store';
import { Component } from '../component';
import { SlideView } from '../slide-view/slide-view';
import playerViewStyles from './player-view.css';

@customElement('player-view')
export class PlayerView extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		playerViewStyles,
	];

	private readonly controller = new PlayerViewController(this);

	@consume({ context: applicationContext })
	accessor applicationContext: ApplicationContext;

	@consume({ context: courseContext })
	accessor courseContext: CourseContext;

	@property({ type: Boolean, reflect: true })
	accessor chatVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	accessor participantsVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	accessor screenVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor rightContainerVisible: boolean = false;

	@query("player-controls")
	accessor controls: PlayerControls;

	@query("screen-view")
	accessor screenView: ScreenView;

	@query("conference-view")
	accessor conferenceView: ConferenceView;

	@query(".video-conference")
	accessor videoConferenceContainer: HTMLElement;

	@query("#inner-split-panel")
	accessor innterSplitPanel: SlSplitPanel;

	@query("#outer-split-panel")
	accessor outerSplitPanel: SlSplitPanel;


	addParticipant(view: ParticipantView) {
		if (courseStore.activeCourse.isConference) {
			this.conferenceView.addGridElement(view);
		}
	}

	override connectedCallback() {
		console.log("--- player view connectedCallback")

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

	override disconnectedCallback() {
		console.log("--- player view disconnectedCallback")
		this.controller.stopTimer();
	}

	protected override async firstUpdated() {
		console.log("--- player view firstUpdated")

		const slideView = this.renderRoot.querySelector<SlideView>("slide-view");

		if (slideView) {
			await slideView.updateComplete;

			this.controller.startTimer();

			this.courseContext.layoutController.update();

			this.setSlideView(slideView);
		}
	}

	protected override render() {
		if (!courseStore.activeCourse) {
			// Course not loaded, nothing to show.
			return null;
		}

		this.screenVisible = participantStore.hasScreenStream();

		return html`
			<sl-split-panel position="0" id="outer-split-panel">
				<div slot="start" class="left-container">
					<div class="feature-container">
						${when(privilegeStore.canViewParticipants(), () => html`
							<participant-list .moderationService="${this.courseContext.moderationService}"></participant-list>
						`)}
					</div>
				</div>
				<div slot="end">
					<sl-split-panel position="100" id="inner-split-panel">
						<div slot="start" class="center-container">
							${when(courseStore.activeCourse.isConference,
								() => html`
								<div class="conference-container">
									<conference-view></conference-view>
								</div>
								`,
								() => html`
								<div class="slide-container">
									<slide-view class="slides"></slide-view>
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
							${repeat(participantStore.getWithStream(), (participant) => participant.userId, (participant) => html`
								<participant-view .participant="${participant}"></participant-view>
							`)}
							</div>
							<div class="feature-container">
								${when(privilegeStore.canUseChat(), () => html`
								<chat-box .chatService="${this.courseContext.chatService}"></chat-box>
								`)}
							</div>
						</div>
					</sl-split-panel>
				</div>
			</sl-split-panel>
		`;
	}

	private setSlideView(slideView: SlideView) {
		this.courseContext.renderController.setSlideView(slideView);

		const toolController = new ToolController(this.courseContext.renderController);
		const mouseListener = new MouseListener(toolController);

		slideView.addMouseListener(mouseListener);
	}
}
