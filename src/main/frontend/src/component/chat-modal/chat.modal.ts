import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { MessageFeature } from "../../model/course-feature";
import { MessageService } from "../../service/message.service";
import { Toaster } from "../toast/toaster";

@customElement("chat-modal")
export class ChatModal extends Modal {

	@property()
	courseId: number;

	@property()
	feature: MessageFeature;


	protected post(event: Event) {
		const messageForm: HTMLFormElement = this.renderRoot.querySelector("message-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		const service = new MessageService();
		service.postMessageFromForm(this.courseId, messageForm)
			.finally(() => {
				messageForm.reset();
				submitButton.disabled = false;

				this.close();
			})
			.catch(error => {
				console.error(error);

				Toaster.showError(`${t("course.feature.message.send.error")}`);
			});
	}

	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("course.feature.message")}</span>
				</header>
				<article>
					<message-form .feature="${this.feature}"></message-form>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
					<button type="button" @click="${this.post}" class="btn btn-outline-primary btn-sm" id="message-submit" form="course-message-form">
						${t("course.feature.message.send")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}