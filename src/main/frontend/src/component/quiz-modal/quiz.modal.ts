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


	post() {
		const quizForm: HTMLFormElement = this.renderRoot.querySelector("quiz-form")
			.shadowRoot.querySelector("form");

		const submitButton: HTMLButtonElement = this.renderRoot.querySelector("#quiz-submit");
		submitButton.disabled = true;

		const data = new FormData(quizForm);
		const value = Object.fromEntries(data.entries());
		value.options = data.getAll("options");

		const service = new QuizService();
		service.postAnswer(this.courseId, JSON.stringify(value))
			.then(response => {
				if (response.statusCode === 0) {
					Toaster.showSuccess(`${t(response.statusMessage)}`);
				}
				else {
					Toaster.showError(`${t(response.statusMessage)}`);
				}
			})
			.catch(error => {
				console.error(error)
			})
			.finally(() => {
				quizForm.reset();
				submitButton.disabled = false;

				this.close();
			});
	}

	render() {
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