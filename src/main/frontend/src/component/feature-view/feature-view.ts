import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
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

	@property()
	privilegeService: PrivilegeService;

	@property({ type: Boolean, reflect: true })
	hasChat: boolean = false;

	@property({ type: Boolean, reflect: true })
	hasQuiz: boolean = false;


	protected updated(): void {
		if (this.privilegeService) {
			if (this.privilegeService.canReadMessages()) {
				this.hasChat = course.chatFeature != null;
			}
			if (this.privilegeService.canParticipateInQuiz()) {
				this.hasQuiz = course.quizFeature != null;
			}
		}
	}

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
