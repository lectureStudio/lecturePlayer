import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatBoxStyles } from './chat-box.styles';
import { Toaster } from '../../component/toast/toaster';
import { MessageService, MessageServiceDirectMessage, MessageServiceMessage } from '../../service/message.service';
import { ChatMessage } from './chat-message';
import { PrivilegeService } from '../../service/privilege.service';
import { chatHistory } from '../../model/chat-history';
import { course } from '../../model/course';

@customElement('chat-box')
export class ChatBox extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		chatBoxStyles,
	];

	@property()
	messageService: MessageService;

	@property()
	privilegeService: PrivilegeService;

	@query(".chat-history-log")
	messageContainer: HTMLElement;


	override connectedCallback() {
		super.connectedCallback()

		chatHistory.addEventListener("all", this.addAllMessages.bind(this), false);
		chatHistory.addEventListener("added", this.addMessage.bind(this), false);
		chatHistory.addEventListener("removed", this.removeMessage.bind(this), false);
		chatHistory.addEventListener("cleared", this.clearMessages.bind(this), false);
	}

	send() {
		const sendButton: HTMLButtonElement = this.shadowRoot.querySelector("#message-submit");
		sendButton.click();
	}

	protected firstUpdated(): void {
		this.addAllMessages();
	}

	protected post(event: Event): void {
		const messageForm: HTMLFormElement = this.renderRoot.querySelector("message-form")
			.shadowRoot.querySelector("form");

		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		this.messageService.postMessage(messageForm)
			.then(() => {
				Toaster.showSuccess(`${t("course.feature.message.sent")}`);

				// Reset form only on success.
				messageForm.reset();
			})
			.catch(error => {
				console.error(error);

				let errorMessage: string;

				if (error === "connection") {
					errorMessage = t("course.feature.message.send.error.connection");
				}
				else if (error === "recipient") {
					errorMessage = t("course.feature.message.send.error.recipient");
				}
				else {
					errorMessage = t("course.feature.message.send.error");
				}

				Toaster.showError(errorMessage);
			})
			.finally(() => {
				submitButton.disabled = false;
			});
	}

	protected render() {
		return html`
			<header part="header">
				${t("course.feature.message")}
			</header>

			<section part="section">
				<div class="chat-history">
					<div class="chat-history-log">
					</div>
				</div>
			</section>

			<footer part="footer">
				${this.privilegeService.canWriteMessages() ? html`
				<message-form .privilegeService="${this.privilegeService}">
					<sl-button slot="right-pane" @click="${this.post}" type="submit" form="course-message-form" id="message-submit" size="medium" circle>
						<sl-icon name="send"></sl-icon>
					</sl-button>
				</message-form>
				` : ''}
			</footer>
		`;
	}

	private addAllMessages() {
		this.clearMessages();

		for (const message of chatHistory.history) {
			this.insertMessage(message);
		}

		this.requestUpdate();

		if (!this.privilegeService.canReadMessages()) {
			// No privilege to read/receive messages.
			return;
		}

		this.updateComplete.then(() => {
			window.setTimeout(() => {
				const lastMessage = this.messageContainer.lastElementChild as ChatMessage;
	
				if (lastMessage) {
					this.scrollToMessage(lastMessage);
				}
			}, 500);
		});
	}

	private addMessage(event: CustomEvent) {
		const message: MessageServiceMessage = event.detail;

		const chatMessage = this.insertMessage(message);
		this.scrollToMessage(chatMessage);
	}

	private removeMessage(event: CustomEvent) {
		const message: MessageServiceMessage = event.detail;

		// const chatMessage = this.insertMessage(message);
		// this.scrollToMessage(chatMessage);
	}

	private clearMessages() {
		if (!this.privilegeService.canReadMessages()) {
			// No privilege to read/receive messages.
			return;
		}

		this.messageContainer.remove;

		while (this.messageContainer.firstChild) {
			this.messageContainer.removeChild(this.messageContainer.firstChild);
		}
	}

	private insertMessage(message: MessageServiceMessage) {
		if (!this.privilegeService.canReadMessages()) {
			// No privilege to read/receive messages.
			return null;
		}

		if (message._type === "MessengerDirectMessage") {
			return this.insertDirectMessage(message as MessageServiceDirectMessage);
		}
		else {
			return this.insertPublicMessage(message);
		}
	}

	private insertPublicMessage(message: MessageServiceMessage): ChatMessage {
		const chatMessage = this.createMessage(message);

		this.messageContainer.appendChild(chatMessage);

		return chatMessage;
	}

	private insertDirectMessage(message: MessageServiceDirectMessage): ChatMessage {
		const toMe = message.recipientId === course.userId;
		const toOrganisers = message.recipientId === "organisers";

		const chatMessage = this.createMessage(message);
		chatMessage.recipient = toMe
			? `${t("course.feature.message.to.me")}`
			: toOrganisers
				? `${t("course.feature.message.to.organisers")}`
				: `${message.recipientFirstName} ${message.recipientFamilyName}`;
		chatMessage.private = true;

		this.messageContainer.appendChild(chatMessage);

		return chatMessage;
	}

	private scrollToMessage(chatMessage: ChatMessage) {
		chatMessage.updateComplete.then(() => {
			chatMessage.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" });
		});
	}

	private createMessage(message: MessageServiceMessage) {
		const byMe = message.userId === course.userId;

		const chatMessage = new ChatMessage();
		chatMessage.sender = byMe ? `${t("course.feature.message.me")}` : `${message.firstName} ${message.familyName}`;
		chatMessage.timestamp = new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
		chatMessage.content = message.text;
		chatMessage.myself = byMe;

		return chatMessage;
	}
}
