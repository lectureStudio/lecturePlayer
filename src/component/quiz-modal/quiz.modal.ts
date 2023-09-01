import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property, query } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { CourseFeatureResponse, QuizAnswer, QuizFeature } from "../../model/course-feature";
import { QuizForm } from "../quiz-form/quiz-form";
import { courseStore } from "../../store/course.store";
import { Toaster } from "../../utils/toaster";
import { CourseQuizApi } from "../../transport/course-quiz-api";

@customElement("quiz-modal")
export class QuizModal extends Modal {

	@property()
	courseId: number;

	@property()
	feature: QuizFeature;

	@query('quiz-form')
	quizForm: QuizForm;


	protected post(event: Event) {
		const quizForm: HTMLFormElement = this.renderRoot.querySelector("quiz-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement>event.target;
		submitButton.disabled = true;

		const data = new FormData(quizForm);
		const answer: QuizAnswer = {
			serviceId: data.get("serviceId").toString(),
			options: data.getAll("options") as string[]
		};

		CourseQuizApi.postQuizAnswer(courseStore.courseId, answer)
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

				this.close();
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
			<sl-dialog label="${t("course.feature.quiz")}">
				<article>
					<quiz-form></quiz-form>
				</article>
				<div slot="footer">
					<sl-button type="button" @click="${this.close}" size="small">
						${t("course.feature.close")}
					</sl-button>
					<sl-button type="button" @click="${this.post}" variant="primary" size="small" id="quiz-submit" form="quiz-form">
						${t("course.feature.quiz.send")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}