import { html, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import { QuizFeature, QuizType } from '../../model/course-feature';
import { quizFormStyles } from './quiz-form.styles';

@customElement('quiz-form')
export class QuizForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		quizFormStyles,
	];

	@property()
	feature: QuizFeature;


	render() {
		const itemTemplates = new Array<TemplateResult>();
		const type = this.feature?.type;

		if (type === QuizType.Multiple) {
			this.feature?.options.forEach((option: string, index: number) => {
				itemTemplates.push(html`
					<sl-checkbox name="options" value="${index}" id="option-${index}">${option}</sl-checkbox>
				`);
			});
		}
		else if (type === QuizType.Single) {
			itemTemplates.push(html`
				<sl-radio-group name="options">
					${this.feature?.options.map((option: string, index: number) =>
						html`<sl-radio value="${index}" id="option-${index}">${option}</sl-radio>`
					)}
				</sl-radio-group>
			`);
		}
		else if (type === QuizType.Numeric) {
			this.feature?.options.forEach((option: string, index: number) => {
				itemTemplates.push(html`
					<sl-input label="${option}" name="options" id="option-${index}" size="small"></sl-input>
				`);
			});
		}

		return html`
			<form id="quiz-form">
				<input type="hidden" name="serviceId" value="${this.feature?.featureId}" />

				<div class="quiz-question">
					${unsafeHTML(this.feature?.question)}
				</div>
				<div class="quiz-options">
					${itemTemplates}
				</div>
			</form>
		`;
	}
}
