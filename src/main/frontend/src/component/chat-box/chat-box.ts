import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatBoxStyles } from './chat-box.styles';
import { Toaster } from '../../component/toast/toaster';

@customElement('chat-box')
export class ChatBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		chatBoxStyles,
	];

	@property()
	courseId: number;

	@property()
	featureId: string;

	@query('#messageSubmit')
	submitButton: HTMLButtonElement;


	private submit(): void {
		const messageForm: HTMLFormElement = this.renderRoot.querySelector("message-form")
			.shadowRoot.querySelector("form");

		this.submitButton.disabled = true;

		const data = new FormData(messageForm);
		const value = Object.fromEntries(data.entries());

		fetch(messageForm.getAttribute("action"), {
			method: "POST",
			body: JSON.stringify(value),
			headers: {
				"Content-Type": "application/json"
			}
		})
		.then(response => {
			if (response.status === 200) {
				Toaster.showSuccess(`${t("course.feature.message.sent")}`);
			}
			else {
				Toaster.showError(`${t("course.feature.message.send.error")}`);
			}

			messageForm.reset();
			this.submitButton.disabled = false;
		})
		.catch(error => console.error(error));
	}

	render() {
		return html`
			<small class="chat-header">
				<label for="messageTextarea">${t("course.feature.message.description")}</label>
			</small>
			<div class="chat-controls">
				<message-form .courseId="${this.courseId}" .featureId="${this.featureId}"></message-form>
				<button @click="${this.submit}" type="submit" form="course-message-form" id="messageSubmit">
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
					</svg>
				</button>
			</div>
		`;
	}
}
