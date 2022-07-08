import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatBoxStyles } from './chat-box.styles';
import { Toaster } from '../../component/toast/toaster';
import { MessageFeature } from '../../model/course-feature';
import { MessageService } from '../../service/message.service';

@customElement('chat-box')
export class ChatBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		chatBoxStyles,
	];

	@property()
	courseId: number;

	@property()
	feature: MessageFeature;


	private submit(): void {
		const messageForm: HTMLFormElement = this.renderRoot.querySelector("message-form")
			.shadowRoot.querySelector("form");

		const submitButton: HTMLButtonElement = this.renderRoot.querySelector("#message-submit");
		submitButton.disabled = true;

		const data = new FormData(messageForm);
		const value = JSON.stringify(Object.fromEntries(data.entries()));

		const service = new MessageService();
		service.postMessage(this.courseId, value)
			.then(response => {
				if (response.statusCode === 0) {
					Toaster.showSuccess(`${t(response.statusMessage)}`);
				}
				else {
					Toaster.showError(`${t(response.statusMessage)}`);
				}
			})
			.catch(error => {
				console.error(error);

				Toaster.showError(`${t("course.feature.message.send.error")}`);
			})
			.finally(() => {
				messageForm.reset();
				submitButton.disabled = false;
			});
	}

	render() {
		return html`
			<header>
				${t("course.feature.message")}
			</header>
			<small class="chat-info">
				<label for="messageTextarea">${t("course.feature.message.description")}</label>
			</small>
			<div class="chat-controls">
				<message-form .feature="${this.feature}"></message-form>
				<button @click="${this.submit}" type="submit" form="course-message-form" id="message-submit">
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
					</svg>
				</button>
			</div>
		`;
	}
}
