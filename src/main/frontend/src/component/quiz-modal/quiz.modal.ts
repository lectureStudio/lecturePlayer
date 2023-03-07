import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { QuizFeature } from "../../model/course-feature";
import { QuizService } from "../../service/quiz.service";
import { Toaster } from "../../utils/toaster";

@customElement("quiz-modal")
export class QuizModal extends Modal {

	@property()
	courseId: number;

	@property()
	feature: QuizFeature;


	protected post(event: Event) {
		const quizForm: HTMLFormElement = this.renderRoot.querySelector("quiz-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		const service = new QuizService();
		service.postAnswerFromForm(this.courseId, quizForm)
			.finally(() => {
				quizForm.reset();
				submitButton.disabled = false;

				this.close();
			})
			.catch(error => {
				console.error(error);

				Toaster.showError(`${t("course.feature.quiz.send.error")}`);
			});
	}

	protected render() {
		return html`
			<sl-dialog label="${t("course.feature.quiz")}">
				<article>
					<quiz-form .feature="${this.feature}"></quiz-form>
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