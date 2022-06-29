import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { Utils } from "../../utils/utils";
import { t } from '../i18n-mixin';
import { QuizFeature } from "../../model/course-state";

@customElement("quiz-modal")
export class QuizModal extends Modal {

	@property()
	courseId: number;

	@property()
	feature: QuizFeature;


	post() {
		this.dispatchEvent(Utils.createEvent("quiz-post"));
		this.close();
	}

	render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("course.feature.quiz")}</span>
				</header>
				<article>
					<quiz-form .courseId="${this.courseId}" .feature="${this.feature}"></quiz-form>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
					<button type="button" @click="${this.post}" class="btn btn-outline-primary btn-sm" form="course-quiz-form">
						${t("course.feature.message.send")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}