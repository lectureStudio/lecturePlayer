import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { QuizFeature } from "../../model/course-feature";
import { QuizService } from "../../service/quiz.service";
import { Toaster } from "../toast/toaster";

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
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("course.feature.quiz")}</span>
				</header>
				<article>
					<quiz-form .feature="${this.feature}"></quiz-form>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
					<button type="button" @click="${this.post}" class="btn btn-outline-primary btn-sm" id="quiz-submit" form="quiz-form">
						${t("course.feature.quiz.send")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}