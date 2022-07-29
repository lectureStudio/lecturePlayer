import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { CourseState } from '../../model/course-state';
import { MessageService } from '../../service/message.service';
import { PrivilegeService } from '../../service/privilege.service';
import { I18nLitElement } from '../i18n-mixin';
import { FeatureViewController } from './feature-view.controller';
import { featureViewStyles } from './feature-view.styles';

@customElement('player-feature-view')
export class PlayerFeatureView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		featureViewStyles,
	];

	private controller = new FeatureViewController(this);

	@state()
	courseState: CourseState;

	@property()
	messageService: MessageService;

	@property()
	privilegeService: PrivilegeService;


	protected render() {
		return html`
			<div>
				<div class="center">
					${this.renderQuiz()}
				</div>
				<div class="right">
					${this.renderChat()}
				</div>
			</div>
		`;
	}

	protected renderChat() {
		if (!this.privilegeService.canReadMessages()) {
			return '';
		}

		return this.courseState?.messageFeature ?
			html`
				<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
			`
			: '';
	}

	protected renderQuiz() {
		if (!this.privilegeService.canParticipateInQuiz()) {
			return '';
		}

		return this.courseState?.quizFeature ?
			html`
				<quiz-box .courseId="${this.courseState?.courseId}" .feature="${this.courseState?.quizFeature}"></quiz-box>
			`
			: '';
	}
}
