import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property, query } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { CourseFeatureResponse, QuizAnswer, QuizFeature } from "../../model/course-feature";
import { QuizForm } from "../quiz-form/quiz-form";
import { courseStore } from "../../store/course.store";
import { Toaster } from "../../utils/toaster";
import { CourseQuizApi } from "../../transport/course-quiz-api";
import { uiStateStore } from "../../store/ui-state.store";

@customElement("quiz-modal")
export class QuizModal extends Modal {

	@property({ type: Number })
	accessor courseId: number;

	@property({ type: Object })
	accessor feature: QuizFeature;

	@query('quiz-form')
	accessor quizForm: QuizForm;


	protected post(): Promise<void> {
		if (!courseStore.activeCourse) {
			throw new Error("Quiz is not active");
		}
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

		return CourseQuizApi.postQuizAnswer(courseStore.activeCourse.id, answer)
			.then(response => {
				this.quizForm.setResponse(response);

				if (response.statusCode === 0) {
					uiStateStore.setQuizSent(true);

					Toaster.showSuccess(`${t(response.statusMessage)}`);
				}
				else {
					Toaster.showError(`${t(response.statusMessage)}`);
				}
			})
			.finally(() => {
				this.quizForm.resetForm();

				this.close();
			})
			.catch(error => {
				const response: CourseFeatureResponse = error.body;

				// Delegate response error to the form.
				this.quizForm.setResponse(response);

				if (response.statusCode === 3) {
					// Multiple answers sent.
					uiStateStore.setQuizSent(true);
				}

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
					<sl-button type="button" @click="${this.post}" ?disabled="${uiStateStore.quizSent}" variant="primary" size="small" id="quiz-submit" form="quiz-form">
						${t("course.feature.quiz.send")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}
