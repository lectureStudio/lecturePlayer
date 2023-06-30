import { html, TemplateResult } from 'lit';
import { when } from "lit/directives/when.js";
import { classMap } from 'lit/directives/class-map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { CourseFeatureResponse, QuizFeature, QuizMinMaxRule, QuizType } from '../../model/course-feature';
import { quizFormStyles } from './quiz-form.styles';

@customElement('quiz-form')
export class QuizForm extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		quizFormStyles,
	];

	@property()
	feature: QuizFeature;

	@property()
	fieldErrors: any = {};


	setResponse(response: CourseFeatureResponse) {
		this.fieldErrors = response.fieldErrors || {};
	}

	render() {
		const itemTemplates = new Array<TemplateResult>();
		const inputRules = this.feature.fieldFilter?.rules;

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
					// Currently there is only one rule implemented for the numeric type.
					const rule = inputRules[index] as QuizMinMaxRule;
					const error = this.fieldErrors[index];
					const classes = { "is-invalid": error != null };

					itemTemplates.push(html`
						<div class="form-check pb-2">
							<label for="option-${index}" class="form-label pb-0 mb-0">${option}</label>
							<input type="number" class="form-control form-control-sm pb-0 ${classMap(classes)}" name="options" min="${rule.min}" max="${rule.max}" id="option-${index}" required>
							${when(rule && rule.type === "min-max", () => html`
								<span class="text-muted form-control-desc">[${rule.min}, ${rule.max}]</span>
							`)}
							${when(error, () => html`
								<span class="form-control-desc invalid-feedback">${t(error)}</span>
							`)}
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
