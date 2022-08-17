import { html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatBoxStyles } from './chat-box.styles';
import { Toaster } from '../../component/toast/toaster';
import { MessageService, MessageServiceDirectMessage, MessageServiceMessage } from '../../service/message.service';
import { ChatMessage } from './chat-message';
import { CourseParticipant } from '../../model/course-state';
import { PrivilegeService } from '../../service/privilege.service';
import { participants } from '../../model/participants';
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

			${this.privilegeService.canWriteMessages() ? html`
			<footer>
				<message-form .privilegeService="${this.privilegeService}"></message-form>
				<button @click="${this.post}" type="submit" form="course-message-form" class="icon-send" id="message-submit"></button>
			</footer>
			` : ''}
		`;
	}

	private addAllMessages() {
		for (const message of chatHistory.history) {
			this.insertMessage(message);
		}

		this.requestUpdate();

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
		this.messageContainer.remove;

		while (this.messageContainer.firstChild) {
			this.messageContainer.removeChild(this.messageContainer.firstChild);
		}
	}

	private insertMessage(message: MessageServiceMessage) {
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
		const toMe = message.recipient === course.userId
		const toOrganisers = message.recipient === "organisers";

		const recipient = this.getParticipant(message.recipient);

		const chatMessage = this.createMessage(message);
		chatMessage.recipient = toMe
			? `${t("course.feature.message.to.me")}`
			: toOrganisers
				? `${t("course.feature.message.to.organisers")}`
				: `${recipient.firstName} ${recipient.familyName}`;
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

	private getParticipant(userId: string): CourseParticipant {
		return participants.participants.find(participant => participant.userId === userId);
	}
}
