import { Component } from '../component';
import { CSSResultGroup, html, TemplateResult } from 'lit';
import { customElement, query, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { ChatMessage, ChatRecipientType, ChatService, DirectChatMessage } from '../../service/chat.service';
import { privilegeStore } from '../../store/privilege.store';
import { participantStore } from '../../store/participants.store';
import { userStore } from '../../store/user.store';
import { chatStore } from "../../store/chat.store";
import { when } from "lit/directives/when.js";
import { CourseParticipant } from "../../model/participant";
import chatFormStyles from './chat-form.css';

@customElement('chat-form')
export class ChatForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		chatFormStyles,
	];

	@property({ type: Boolean, reflect: true })
	replying: boolean = false;

	@property()
	chatService: ChatService;

	@query('#recipients')
	private recipientSelect: HTMLSelectElement;

	@query('form')
	private form: HTMLFormElement;

	private selectedRecipient: string;

	private msgIdToReplyTo: string;


	override connectedCallback() {
		super.connectedCallback()
	}

	getFormData() {
		return new FormData(this.form);
	}

	resetForm() {
		this.form.querySelectorAll<HTMLInputElement>("[resettable]")
			.forEach(element => {
				element.value = "";
			});
	}

	notifyAboutReply(msgIdToReplyTo: string) {
		this.replying = true;
		this.msgIdToReplyTo = msgIdToReplyTo;
	}

	notifyAboutMessageSending() {
		this.replying = false;
	}

	protected override updated() {
		const canWriteToAll = privilegeStore.canWriteMessagesToAll();
		const canWriteToOrga = privilegeStore.canWriteMessagesToOrganisators();
		const canWriteToPrivate = privilegeStore.canWritePrivateMessages();

		const messageToReplyTo: ChatMessage | undefined = this.replying
			? chatStore.getMessageById(this.msgIdToReplyTo)!
			: undefined;
		const isPrivateReply = this.replying && ChatService.isPrivateMessage(messageToReplyTo!);
		const isReplyToOrga =  this.replying && ChatService.isMessageToOrganisers(messageToReplyTo!);
		const isReplyToAll = this.replying && !(ChatService.isDirectMessage(messageToReplyTo!))

		if (isPrivateReply && canWriteToPrivate) {
			this.recipientSelect.value = participantStore.findByUserId((messageToReplyTo as DirectChatMessage).recipientId)!.userId
		}
		// Keep the previous recipient selected.
		else if (canWriteToAll && !this.selectedRecipient ||
				this.selectedRecipient === ChatRecipientType.Public ||
				canWriteToAll && isReplyToAll) {
			this.recipientSelect.value = ChatRecipientType.Public;
		}
		else if (canWriteToOrga && !this.selectedRecipient ||
				this.selectedRecipient === ChatRecipientType.Organisers ||
				isReplyToOrga && canWriteToOrga) {
			this.recipientSelect.value = ChatRecipientType.Organisers;
		}
		else {
			const recipient = participantStore.findByUserId(this.selectedRecipient);

			this.recipientSelect.value = recipient ? this.selectedRecipient : "";
		}
	}

	protected override render() {
		const canWriteToAll = privilegeStore.canWriteMessagesToAll();
		const canWriteToOrga = privilegeStore.canWriteMessagesToOrganisators();
		const optionTemplates: TemplateResult[] = [];

		if (this.replying) {
			const messageToReplyTo = chatStore.getMessageById(this.msgIdToReplyTo)!;
			this.replying = !messageToReplyTo.deleted;
		}

		if (privilegeStore.canWritePrivateMessages()) {
			for (const participant of participantStore.participants) {
				if (participant.userId !== userStore.userId) {
					optionTemplates.push(html`<sl-option value="${participant.userId}">${participant.firstName} ${participant.familyName}</sl-option>`);
				}
			}
		}

		const allOption = canWriteToAll
			? html`<sl-option value="${ChatRecipientType.Public}">${t("course.feature.message.target.all")}</sl-option>`
			: '';

		const organisatorsOption = canWriteToOrga
			? html`<sl-option value="${ChatRecipientType.Organisers}">${t("course.feature.message.target.organisers")}</sl-option>`
			: '';

		if (optionTemplates.length > 0 && (canWriteToAll || canWriteToOrga)) {
			optionTemplates.unshift(html`<sl-divider></sl-divider>`);
		}

		return html`
			<form id="course-message-form">
				<div class="recipient-container">
					<span>${t("course.feature.message.target")}</span>
					<sl-select @sl-change=${this.onRecipient} name="recipient" id="recipients" size="small" hoist>
						${when(this.replying, 
							() => this.getAvailableRecipientOptions(chatStore.getMessageById(this.msgIdToReplyTo)!, allOption, organisatorsOption), 
							() => html`${allOption} ${organisatorsOption} ${optionTemplates}`)}
					</sl-select>
				</div>
				<div class="message-container">
					<div class="message">
						${when(this.replying, () => this.renderMsgToReplyTo())}
						<sl-textarea name="text" placeholder="${t("course.feature.message.placeholder")}" rows="2" resize="none" size="small" resettable></sl-textarea>
					</div>
					<slot name="right-pane"></slot>
				 </div>
				</div>
			</form>
		`;
	}

	getMessageToReplyTo(): string {
		return this.msgIdToReplyTo;
	}

	private renderMsgToReplyTo() {
		const messageToReplyTo = chatStore.getMessageById(this.msgIdToReplyTo)!;
		const sender = ChatService.getMessageSender(messageToReplyTo, ChatService.isDirectMessage(messageToReplyTo));

		return html`
			<div class="reply-message-container">
				<div>
					<span id="reply-msg-sender">${sender}</span>
					<sl-icon-button id="cancel-reply" name="close" @click="${this.cancelReply}" size="small"></sl-icon-button>
				</div>
				<pre>${chatStore.getMessageById(this.msgIdToReplyTo)!.text}</pre>
			</div>
		`;
	}

	private onRecipient() {
		// Save recipient due to re-rendering of the selection component.
		this.selectedRecipient = this.recipientSelect.value;
	}

	private cancelReply() {
		this.replying = false;
	}

	private getAvailableRecipientOptions(messageToReplyTo: ChatMessage,
			allOption: TemplateResult | "",
			organisatorsOption: TemplateResult | "") {
		if(ChatService.isMessageToOrganisers(messageToReplyTo)) return html`${organisatorsOption}`;
		if(ChatService.isPrivateMessage(messageToReplyTo)) {
			const recipient: CourseParticipant = participantStore.findByUserId((messageToReplyTo as DirectChatMessage).recipientId)!;
			return html`
				<sl-option value="${recipient.userId}">${recipient.firstName} ${recipient.familyName}</sl-option>
			`;
		}

		return html`${allOption}`
	}
}
