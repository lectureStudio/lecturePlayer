import { CSSResultGroup, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { CourseFeatureResponse, QuizAnswer } from '../../model/course-feature';
import { I18nLitElement, t } from '../i18n-mixin';
import { QuizForm } from '../quiz-form/quiz-form';
import { Component } from '../component';
import { courseStore } from '../../store/course.store';
import { Toaster } from '../../utils/toaster';
import { CourseQuizApi } from '../../transport/course-quiz-api';
import quizBoxStyles from './quiz-box.css';

@customElement('quiz-box')
export class QuizBox extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		quizBoxStyles
	];

	@query('quiz-form')
	quizForm: QuizForm;


	protected post(event: Event): Promise<void> {
		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		if (!this.quizForm) {
			throw new Error("Form is null");
		}

		const data = this.quizForm.getFormData();
		const serviceId = data.get("serviceId");
		const options = data.getAll("options");

		if (!serviceId) {
			return Promise.reject("Service id is not set");
		}
		if (!options) {
			return Promise.reject("Options are not set");
		}

		const answer: QuizAnswer = {
			serviceId: serviceId.toString(),
			options: options as string[]
		};

		return CourseQuizApi.postQuizAnswer(courseStore.courseId, answer)
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
				this.quizForm.resetForm();
				submitButton.disabled = false;
			})
			.catch(error => {
				const response: CourseFeatureResponse = error.body;

				// Delegate response error to the form.
				this.quizForm.setResponse(response);

				Toaster.showError(`${t(response.statusMessage)}`);
			});
	}

	protected override render() {
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
