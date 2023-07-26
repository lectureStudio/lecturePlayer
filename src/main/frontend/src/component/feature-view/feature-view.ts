import { PropertyValues, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { I18nLitElement, t } from '../i18n-mixin';
import { FeatureViewController } from './feature-view.controller';
import { featureViewStyles } from './feature-view.styles';
import { course } from '../../model/course';
import { SlSplitPanel, SlTab, SlTabGroup } from '@shoelace-style/shoelace';

@customElement('player-feature-view')
export class PlayerFeatureView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		featureViewStyles,
	];

	private controller = new FeatureViewController(this);

	private readonly maxWidth600Query: MediaQueryList;

	@property()
	messageService: MessageService;

	@property()
	privilegeService: PrivilegeService;

	@query("#outer-split-panel")
	outerSplitPanel: SlSplitPanel;

	@query("sl-tab-group")
	tabGroup: SlTabGroup;

	@property({ reflect: true })
	participantsVisible: boolean = true;

	section: string = "chat";

	isCompactMode: boolean = false;

	hasChat: boolean = false;

	hasQuiz: boolean = false;


	constructor() {
		super();

		// Matches with the css query.
		this.maxWidth600Query = window.matchMedia("(max-width: 600px)");
		this.maxWidth600Query.onchange = (event) => {
			this.onCompactLayout(event.matches);
		};

		this.isCompactMode = this.maxWidth600Query.matches;
	}

	async refresh() {
		this.updateState();
		this.requestUpdate();
		// Update once again for smooth tab selection as tabs come and go.
		await this.updateComplete;
		this.requestUpdate();
	}

	protected willUpdate(changedProperties: PropertyValues): void {
		super.willUpdate(changedProperties);

		if (this.tabGroup) {
			let showSection = this.section;
			let tab: SlTab = this.tabGroup.querySelector(`sl-tab[panel=${this.section}]`);

			tab = this.checkOrGetDefault(tab);
			if (tab) {
				showSection = tab.panel;
			}

			this.tabGroup.show(showSection);
		}
	}

	protected render() {
		return html`
			<div>
				<sl-split-panel position="0" id="outer-split-panel">
					<div slot="start" class="left-container">
						<div class="participants-container">
						${when(this.participantsVisible, () => html`
							<participants-box></participants-box>
						`)}
						</div>
					</div>
					<div slot="end" class="center-container">
						<div class="feature-container">
							<sl-tab-group>
								${this.renderChat()}
								${this.renderQuiz()}
								${this.renderParticipants()}
							</sl-tab-group>
						</div>
					</div>
				</sl-split-panel>
			</div>
		`;
	}

	protected renderChat() {
		if (!this.hasChat) {
			return '';
		}

		return html`
			<sl-tab slot="nav" panel="chat">${t("course.feature.message")}</sl-tab>
			<sl-tab-panel name="chat">
				<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
			</sl-tab-panel>
		`;
	}

	protected renderQuiz() {
		if (!this.hasQuiz) {
			return '';
		}

		return html`
			<sl-tab slot="nav" panel="quiz">${t("course.feature.quiz")}</sl-tab>
			<sl-tab-panel name="quiz">
				<quiz-box .courseId="${course.courseId}" .feature="${course.quizFeature}"></quiz-box>	
			</sl-tab-panel>
		`;
	}

	protected renderParticipants() {
		if (!this.isCompactMode || !this.participantsVisible) {
			return '';
		}

		return html`
			<sl-tab slot="nav" panel="participants">${t("course.participants")}</sl-tab>
			<sl-tab-panel name="participants">
				<participants-box></participants-box>
			</sl-tab-panel>
		`;
	}

	private updateState() {
		if (this.privilegeService) {
			this.participantsVisible = this.privilegeService.canViewParticipants();

			this.hasChat = this.privilegeService.canReadMessages() ? (course.chatFeature != null) : false;
			this.hasQuiz = this.privilegeService.canParticipateInQuiz() ? (course.quizFeature != null) : false;
		}

		const tab: SlTab = this.tabGroup.querySelector("sl-tab[active]");

		// Quiz has priority.
		this.section = this.hasQuiz ? "quiz" : (tab ? tab.panel : this.section);
	}

	private onCompactLayout(compact: boolean) {
		this.isCompactMode = compact;

		let tab: SlTab = this.tabGroup.querySelector("sl-tab[active]");

		// Select non-participants tab for activation.
		if (tab.panel !== "participants") {
			this.section = tab.panel;
		}
		else {
			// Select first tab as default one.
			tab = this.checkOrGetDefault(null);
			if (tab) {
				this.section = tab.panel;
			}
		}

		this.requestUpdate();
	}

	private checkOrGetDefault(tab: SlTab): SlTab {
		if (!tab) {
			return this.tabGroup.querySelector("sl-tab:first-of-type");
		}
		return tab;
	}
}
