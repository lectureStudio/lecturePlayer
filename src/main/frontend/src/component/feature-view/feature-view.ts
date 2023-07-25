import { PropertyValues, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { I18nLitElement } from '../i18n-mixin';
import { FeatureViewController } from './feature-view.controller';
import { featureViewStyles } from './feature-view.styles';
import { course } from '../../model/course';
import { SlSplitPanel, SlTabGroup } from '@shoelace-style/shoelace';

@customElement('player-feature-view')
export class PlayerFeatureView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		featureViewStyles,
	];

	private controller = new FeatureViewController(this);

	@property()
	section: string = "chat";

	@property()
	messageService: MessageService;

	@property()
	privilegeService: PrivilegeService;

	@property({ type: Boolean, reflect: true })
	participantsVisible: boolean = true;

	@property({ type: Boolean, reflect: true })
	hasChat: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasQuiz: boolean = false;

	@query("#outer-split-panel")
	outerSplitPanel: SlSplitPanel;

	@query("sl-tab-group")
	tabGroup: SlTabGroup;


	protected willUpdate(changedProperties: PropertyValues): void {
		if (this.privilegeService) {
			this.participantsVisible = this.privilegeService.canViewParticipants();

			if (this.privilegeService.canReadMessages()) {
				this.hasChat = course.chatFeature != null;
			}
			if (this.privilegeService.canParticipateInQuiz()) {
				this.hasQuiz = course.quizFeature != null;
			}
		}

		// Quiz has priority.
		this.section = this.hasQuiz ? "quiz" : "chat";

		if (this.tabGroup) {
			this.tabGroup.show(this.section);
		}

		super.willUpdate(changedProperties);
	}

	protected render() {
		return html`
			<div>
				<sl-split-panel position="0" id="outer-split-panel">
					<div slot="start" class="left-container">
						<div class="participants-container">
							${when(this.privilegeService.canViewParticipants(), () => html`
								<participants-box></participants-box>
							`)}
						</div>
					</div>
					<div slot="end">
						<div class="feature-container">
							<sl-tab-group activation="manual">
								<sl-tab slot="nav" class="chat-context" panel="chat" .active="${!this.hasQuiz}">Chat</sl-tab>
								<sl-tab slot="nav" class="quiz-context" panel="quiz" .active="${this.hasQuiz}">Quiz</sl-tab>

								<sl-tab-panel name="chat">
									${this.renderChat()}
								</sl-tab-panel>
								<sl-tab-panel name="quiz">
									${this.renderQuiz()}
								</sl-tab-panel>
							</sl-tab-group>
						</div>
					</div>
				</sl-split-panel>
			</div>
		`;
	}

	protected renderChat() {
		if (!this.privilegeService.canReadMessages()) {
			return '';
		}

		return course.chatFeature ?
			html`
				<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
			`
			: '';
	}

	protected renderQuiz() {
		if (!this.privilegeService.canParticipateInQuiz()) {
			return '';
		}

		return course.quizFeature ?
			html`
				<quiz-box .courseId="${course.courseId}" .feature="${course.quizFeature}"></quiz-box>
			`
			: '';
	}
}
