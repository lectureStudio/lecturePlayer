import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { I18nLitElement } from '../i18n-mixin';
import { FeatureViewController } from './feature-view.controller';
import { featureViewStyles } from './feature-view.styles';
import { course } from '../../model/course';

@customElement('player-feature-view')
export class PlayerFeatureView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		featureViewStyles,
	];

	private controller = new FeatureViewController(this);

	@property()
	messageService: MessageService;

	@property({ type: Boolean, reflect: true })
	hasChat: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasQuiz: boolean = false;


	protected updated(): void {
		if (PrivilegeService.canReadMessages()) {
			this.hasChat = course.chatFeature != null;
		}
		if (PrivilegeService.canParticipateInQuiz()) {
			this.hasQuiz = course.quizFeature != null;
		}
	}

	protected render() {
		return html`
			<div>
				<div class="center">
					${when(PrivilegeService.canParticipateInQuiz() && course.quizFeature, () => html`
					<quiz-box .courseId="${course.courseId}" .feature="${course.quizFeature}"></quiz-box>
					`)}
				</div>
				<div class="right">
					${when(PrivilegeService.canReadMessages() && course.chatFeature, () => html`
					<chat-box .messageService="${this.messageService}"></chat-box>
					`)}
				</div>
			</div>
		`;
	}
}
