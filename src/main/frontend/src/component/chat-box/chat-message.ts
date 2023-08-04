import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { chatMessageStyles } from './chat-message.styles';
import { Component } from '../component';
import { ChatMessage, DirectChatMessage } from '../../service/message.service';
import { userStore } from '../../store/user.store';

@customElement('chat-box-message')
export class ChatBoxMessage extends Component {

	static styles = [
		I18nLitElement.styles,
		chatMessageStyles,
	];

	@property()
	message: ChatMessage;

	@property({ type: Boolean, reflect: true })
	myself: boolean;

	@property({ type: Boolean, reflect: true })
	private: boolean;

	timestamp: string;

	content: string;

	sender: string;


	protected override firstUpdated() {
		this.private = this.message._type === "MessengerDirectMessage";
		this.timestamp = ChatBoxMessage.getMessageDate(this.message);
		this.sender = ChatBoxMessage.getMessageSender(this.message, this.private);
		this.content = this.message.text;
		this.myself = this.message.userId === userStore.userId;
	}

	protected override render() {
		return html`
			<div class="message-head">
				<span class="message-time">${this.timestamp}</span>
				<span class="message-sender">${this.sender}</span>

				${when(this.private, () => html`
					<span class="message-private">${t("course.feature.message.privately")}</span>
				`)}
			</div>
			<div class="chat-message-boxed">
				<div class="chat-message-content">
					${this.content}
				</div>
			</div>
		`;
	}

	private static getMessageRecipient(message: DirectChatMessage) {
		const toMe = message.recipientId === userStore.userId;
		const toOrganisers = message.recipientId === "organisers";

		return toMe
			? `${t("course.feature.message.to.me")}`
			: toOrganisers
				? `${t("course.feature.message.to.organisers")}`
				: `${message.recipientFirstName} ${message.recipientFamilyName}`;
	}

	private static getMessageSender(message: ChatMessage, direct: boolean) {
		const byMe = message.userId === userStore.userId;
		const sender = byMe ? `${t("course.feature.message.me")}` : `${message.firstName} ${message.familyName}`;
		const recipient = direct ? ChatBoxMessage.getMessageRecipient(message as DirectChatMessage) : null;

		if (direct) {
			return t("course.feature.message.recipient", {
				sender: sender,
				recipient: recipient
			});
		}

		return sender;
	}

	private static getMessageDate(message: ChatMessage) {
		return new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}
}