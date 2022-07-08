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

		this.feature?.options.forEach((option: string, index: number) => {
			switch (this.feature.type) {
				case QuizType.Multiple:
					itemTemplates.push(html`
						<div class="form-check">
							<input class="form-check-input" type="checkbox" name="options" value="${index}" id="option-${index}">
							<label class="form-check-label" for="option-${index}">${option}</label>
						</div>
					`);
					break;

				case QuizType.Single:
					itemTemplates.push(html`
						<div class="form-check">
							<input class="form-check-input" type="radio" name="options" value="${index}" id="option-${index}">
							<label class="form-check-label" for="option-${index}">${option}</label>
						</div>
					`);
					break;

				case QuizType.Numeric:
					itemTemplates.push(html`
						<div class="form-check">
							<label for="option-${index}" class="form-label">${option}</label>
							<input type="text" class="form-control form-control-sm" name="options" id="option-${index}">
						</div>
					`);
					break;
			}
		});

		return html`
			<form id="quiz-form">
				<input type="hidden" name="serviceId" value="${this.feature?.featureId}" />

				<div class="mb-1">
					${unsafeHTML(this.feature?.question)}
				</div>
				<div class="py-2">
					${itemTemplates}
				</div>
			</form>
		`;
	}
}
