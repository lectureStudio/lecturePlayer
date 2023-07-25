import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { CourseFeatureResponse, QuizFeature } from '../../model/course-feature';
import { QuizService } from '../../service/quiz.service';
import { I18nLitElement, t } from '../i18n-mixin';
import { Toaster } from '../toast/toaster';
import { quizBoxStyles } from './quiz-box.styles';
import { QuizForm } from '../quiz-form/quiz-form';

@customElement('quiz-box')
export class QuizBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		quizBoxStyles
	];

	@property()
	courseId: number;

	@property()
	feature: QuizFeature;

	@query('quiz-form')
	quizForm: QuizForm;


	protected post(event: Event) {
		const quizForm: HTMLFormElement = this.renderRoot.querySelector("quiz-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		const service = new QuizService();
		service.postAnswerFromForm(this.courseId, quizForm)
			.then(response => {
				this.quizForm.setResponse(response);

				if (response.statusCode === 0) {
					Toaster.showSuccess(`${t(response.statusMessage)}`);
				}
				else {
					Toaster.showError(`${t(response.statusMessage)}`);
				}
			})
			.finally(() => {
				quizForm.reset();
				submitButton.disabled = false;
			})
			.catch(error => {
				const response: CourseFeatureResponse = error.body;

				// Delegate response error to the form.
				this.quizForm.setResponse(response);

				Toaster.showError(`${t(response.statusMessage)}`);
			});
	}

	protected render() {
		return html`
			<article>
				<header part="header">
					${t("course.feature.quiz")}
				</header>
				<section part="section">
					<quiz-form .feature="${this.feature}"></quiz-form>
				</section>
				<footer part="footer">
					<button type="button" @click="${this.post}" class="btn btn-outline-primary btn-sm" id="quiz-submit" form="quiz-form">
						${t("course.feature.quiz.send")}
					</button>
				</footer>
			</article>
		`;
	}
}
