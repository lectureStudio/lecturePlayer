import { html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { CourseFeatureResponse } from '../../model/course-feature';
import { QuizService } from '../../service/quiz.service';
import { I18nLitElement, t } from '../i18n-mixin';
import { QuizForm } from '../quiz-form/quiz-form';
import { Component } from '../component';
import { courseStore } from '../../store/course.store';
import { Toaster } from '../../utils/toaster';
import quizBoxStyles from './quiz-box.scss';

@customElement('quiz-box')
export class QuizBox extends Component {

	static styles = [
		I18nLitElement.styles,
		quizBoxStyles
	];

	@query('quiz-form')
	quizForm: QuizForm;


	protected post(event: Event) {
		const quizForm: HTMLFormElement = this.renderRoot.querySelector("quiz-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		const service = new QuizService();
		service.postAnswerFromForm(courseStore.courseId, quizForm)
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
			<header part="header">
				${t("course.feature.quiz")}
			</header>
			<section part="section">
				<quiz-form></quiz-form>
			</section>
			<footer part="footer">
				<sl-button @click="${this.post}" form="quiz-form" id="quiz-submit" size="small">
					${t("course.feature.quiz.send")}
					<sl-icon slot="suffix" name="send"></sl-icon>
				</sl-button>
			</footer>
		`;
	}
}
