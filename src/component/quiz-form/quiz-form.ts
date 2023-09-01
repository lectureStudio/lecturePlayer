import { html, TemplateResult } from 'lit';
import { when } from "lit/directives/when.js";
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { CourseFeatureResponse, QuizMinMaxRule, QuizType } from '../../model/course-feature';
import { featureStore } from '../../store/feature.store';
import { Component } from '../component';
import quizFormStyles from './quiz-form.scss';

@customElement('quiz-form')
export class QuizForm extends Component {

	static styles = [
		I18nLitElement.styles,
		quizFormStyles,
	];

	@property()
	fieldErrors = {};


	setResponse(response: CourseFeatureResponse) {
		this.fieldErrors = response.fieldErrors || {};
	}

	render() {
		const feature = featureStore.quizFeature;
		const itemTemplates = new Array<TemplateResult>();
		const inputRules = feature?.fieldFilter?.rules;
		const type = feature?.type;

		if (type === QuizType.Multiple) {
			feature?.options.forEach((option: string, index: number) => {
				itemTemplates.push(html`
					<sl-checkbox name="options" class="quiz-option" value="${index}" id="option-${index}">${option}</sl-checkbox>
				`);
			});
		}
		else if (type === QuizType.Single) {
			itemTemplates.push(html`
				<sl-radio-group name="options" class="quiz-option">
					${feature?.options.map((option: string, index: number) =>
						html`<sl-radio value="${index}" id="option-${index}">${option}</sl-radio>`
					)}
				</sl-radio-group>
			`);
		}
		else if (type === QuizType.Numeric) {
			feature?.options.forEach((option: string, index: number) => {
				// Currently there is only one rule implemented for the numeric type.
				const rule = inputRules[index] as QuizMinMaxRule;
				const error = this.fieldErrors[index];

				itemTemplates.push(html`
					<div class="quiz-option">
						<sl-input type="number" label="${option}" help-text="[${rule.min}, ${rule.max}]" name="options"
							min="${rule.min}"
							max="${rule.max}"
							id="option-${index}"
							size="small">
						</sl-input>
						${when(error, () => html`
							<span class="form-control-desc error-feedback">${t(error)}</span>
						`)}
					</div>
				`);
			});
		}

		return html`
			<form id="quiz-form">
				<input type="hidden" name="serviceId" value="${feature?.featureId}" />

				<div class="quiz-question">
					${unsafeHTML(feature?.question)}
				</div>
				<div class="quiz-options">
					${itemTemplates}
				</div>
			</form>
		`;
	}
}
