import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { QuizFeature } from '../../model/course-feature';
import { QuizService } from '../../service/quiz.service';
import { I18nLitElement, t } from '../i18n-mixin';
import { Toaster } from '../../utils/toaster';
import { quizBoxStyles } from './quiz-box.styles';

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
			})
			.catch(error => {
				console.error(error);

				Toaster.showError(`${t("course.feature.quiz.send.error")}`);
			});
	}

	protected render() {
		return html`
			<article>
				<header>
					${t("course.feature.quiz")}
				</header>
				<section>
					<quiz-form .feature="${this.feature}"></quiz-form>
				</section>
				<footer>
					<sl-button @click="${this.post}" variant="primary" size="small" id="quiz-submit" form="quiz-form">
						${t("course.feature.quiz.send")}
					</sl-button>
				</footer>
			</article>
		`;
	}
}
