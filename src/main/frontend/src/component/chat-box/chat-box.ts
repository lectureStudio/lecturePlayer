import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatBoxStyles } from './chat-box.styles';
import { Toaster } from '../../component/toast/toaster';
import { MessageService, MessageServiceMessage } from '../../service/message.service';
import { ChatMessage } from './chat-message';

@customElement('chat-box')
export class ChatBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		chatBoxStyles,
	];

	@property()
	messageService: MessageService;

	@query(".chat-history-log")
	messageContainer: HTMLElement;


	override connectedCallback() {
		super.connectedCallback()

		this.messageService.addEventListener("message-service-message-history", this.addMessageHistory.bind(this));
		this.messageService.addEventListener("message-service-public-message", this.addPublicMessage.bind(this));
		this.messageService.addEventListener("message-service-private-message", this.addPrivateMessage.bind(this));
	}

	protected firstUpdated() {
		// If the message service already has the history, show it.
		this.addAllMessages(this.messageService.getMessageHistory());

		window.setTimeout(() => {
			const lastMessage = this.messageContainer.lastElementChild as ChatMessage;

			if (lastMessage) {
				this.scrollToMessage(lastMessage);
			}
		}, 100);
	}

	protected post(event: Event): void {
		const messageForm: HTMLFormElement = this.renderRoot.querySelector("message-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		this.messageService.postMessage(messageForm)
			.then(() => {
				Toaster.showSuccess(`${t("course.feature.message.sent")}`);
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

	protected render() {
		return html`
			<header>
				${t("course.feature.message")}
			</header>
			<section>
				<div class="chat-history">
					<div class="chat-history-log">
					</div>
				</div>
			</section>
			<footer>
				<message-form .userId="${this.messageService?.userId}"></message-form>
				<button @click="${this.post}" type="submit" form="course-message-form" id="message-submit">
					<svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
						<path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
					</svg>
				</button>
			</footer>
		`;
	}

	private addAllMessages(messages: MessageServiceMessage[]) {
		for (const message of messages) {
			this.insertMessage(message);
		}
	}

	private addMessageHistory(event: CustomEvent) {
		const messages: MessageServiceMessage[] = event.detail;

		this.addAllMessages(messages);
	}

	private addPublicMessage(event: CustomEvent) {
		const message: MessageServiceMessage = event.detail;

		const chatMessage = this.insertMessage(message);
		this.scrollToMessage(chatMessage);
	}

	private addPrivateMessage(event: CustomEvent) {
		const message: MessageServiceMessage = event.detail;

		const chatMessage = this.insertMessage(message);
		this.scrollToMessage(chatMessage);
	}

	private insertMessage(message: MessageServiceMessage): ChatMessage {
		const chatMessage = this.createMessage(message);

		this.messageContainer.appendChild(chatMessage);

		return chatMessage;
	}

	private scrollToMessage(chatMessage: ChatMessage) {
		chatMessage.updateComplete.then(() => {
			chatMessage.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
		});
	}

	private createMessage(message: MessageServiceMessage) {
		const chatMessage = new ChatMessage();
		chatMessage.originator = message.firstName + " " + message.familyName;
		chatMessage.timestamp = new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		chatMessage.content = message.text;
		chatMessage.myself = message.userId === this.messageService.userId;

		return chatMessage;
	}
}
