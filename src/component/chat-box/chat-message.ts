import { CSSResultGroup, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { Component } from '../component';
import { SlTooltip } from '@shoelace-style/shoelace';
import { ChatMessage, ChatMessageAsReply, ChatService } from '../../service/chat.service';
import { userStore } from '../../store/user.store';
import { Toaster } from "../../utils/toaster";
import { ChatForm } from "../chat-form/chat-form";
import { chatStore } from "../../store/chat.store";
import { privilegeStore } from "../../store/privilege.store";
import chatMessageStyles from './chat-message.css';

@customElement('chat-box-message')
export class ChatBoxMessage extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		chatMessageStyles,
	];

	@property({ type: Object })
	accessor message: ChatMessage;

	@property({ type: Object })
	accessor chatService: ChatService;

	@property({ type: Object })
	accessor chatForm: ChatForm;

	@property({ type: Boolean, reflect: true })
	accessor myself: boolean;

	@property({ type: Boolean, reflect: true })
	accessor private: boolean;

	@property({ type: Boolean })
	accessor editing: boolean = false;

	@property({ type: Boolean, reflect: true })
	accessor edited: boolean = false;

	@query('#delete-tooltip')
	accessor deleteTooltip: SlTooltip;

	@query('#edit-tooltip')
	accessor editTooltip: SlTooltip;

	@query(".chat-message-boxed")
	accessor chatMessageBoxed: HTMLElement;

	editedText: string = "";

	timestamp: string;

	content: string;

	sender: string;

	globalClickListener: (e: MouseEvent) => void;


	protected override firstUpdated() {
		this.private = ChatService.isDirectMessage(this.message);
		this.timestamp = ChatBoxMessage.getMessageDate(this.message);
		this.sender = ChatService.getMessageSender(this.message, this.private);
		this.content = this.message.deleted ? t("course.feature.message.deleted.content") : this.message.text;
		this.myself = this.message.userId === userStore.userId;
		this.edited = this.message.edited;
	}

	protected override render() {
		return html`
			<div class="message-head">
				<span class="message-time">${this.timestamp}</span>
				<span class="message-sender">${this.sender}</span>

				${when(this.private, () => html`
					<span class="message-private">${t("course.feature.message.privately")}</span>
				`)}
				${when(this.message.edited, () => html`
					<span class="message-edited">${t("course.feature.message.edited.content")}</span>
				`)}
			</div>
			<div class="chat-message-container">
				${when(ChatService.isReply(this.message), () => this.renderMsgToReplyTo())}
				<div class="chat-message-boxed">
					${when(this.editing, () => html`
						<div class="chat-message-edit">
							<textarea
								@input="${(e: InputEvent) => this.editedText = (e.target as HTMLTextAreaElement).value}"
								.value="${this.editedText}" id="edit-message-textarea">
							</textarea>
							<sl-button id="message-submit" slot="right-pane" @click="${this.postEditedMessage}"
									   type="submit" form="course-message-form" size="medium" circle>
								<sl-icon name="send"></sl-icon>
							</sl-button>
						</div>
					`)}
					${when(!this.editing, () => html`
						<pre class="chat-message-content">${this.message.text}</pre>
					`)}
				</div>
			</div>
			${this.renderModifyButtons()}
		`;
	}

	private renderModifyButtons() {
		const disableButtons: boolean = this.message.deleted || this.editing;

		return html`
			<div class="modify-buttons">
				<sl-tooltip id="reply-tooltip" .content="${t("course.feature.message.reply.button")}" trigger="hover">
					<sl-icon-button name="chat-reply" @click="${this.replyToMessage}" form="course-message-form" size="small" ?disabled="${!this.canReply()}"></sl-icon-button>
				</sl-tooltip>
				${when(this.myself, () => html`
					<sl-tooltip id="delete-tooltip" .content="${t("course.feature.message.delete.button")}" trigger="hover">
						<sl-icon-button name="chat-delete" @click="${this.deleteMessage}" form="course-message-form" size="small" ?disabled="${disableButtons}"></sl-icon-button>
					</sl-tooltip>
					<sl-tooltip id="edit-tooltip" .content="${t("course.feature.message.edit.button")}" trigger="hover">
						<sl-icon-button name="chat-edit" @click="${this.editMessage}" form="course-message-form" size="small" ?disabled="${disableButtons}"></sl-icon-button>
					</sl-tooltip>
				`)}
			</div>
		`;
	}

	private renderMsgToReplyTo() {
		const messageToReplyTo: ChatMessage = chatStore.getMessageById((this.message as ChatMessageAsReply).msgIdToReplyTo)!;

		return html`
			<div class="reply-message-boxed">
				
				<div class="reply-message-header">
					<span>${ChatService.getMessageSender(messageToReplyTo, this.private)}</span>
				</div>
				<div class="reply-message-content">
					${when(messageToReplyTo.deleted,
						() => html`<span class="deleted-message-content">${t("course.feature.message.deleted.content")}</span>`,
						() => html`<pre>${messageToReplyTo.text}</pre>`)}
				</div>
			</div>
		`;
	}

	private deleteMessage(event: Event) : void {
		const deleteButton = <HTMLButtonElement> event.target;
		deleteButton.disabled = true;

		this.hideTooltips();

		const messageId: string = this.message.messageId;
		this.chatService.deleteMessage(messageId)
			.then(() => {
				Toaster.showSuccess(`${t("course.feature.message.deleted")}`)
			})
			.catch(error => {
				console.error(error);

				let errorMessage: string;

				if (error === "connection") {
					errorMessage = t("course.feature.message.delete.error.connection");
				}
				else {
					errorMessage = t("course.feature.message.delete.error");
				}

				Toaster.showError(errorMessage);

				deleteButton.disabled = false;
			});

	}

	private replyToMessage(event: Event) : void {
		if (!this.chatForm) {
			throw new Error("Form is null");
		}
		this.chatForm.notifyAboutReply(this.message.messageId);
	}

	private editMessage(event: Event) : void {
		const editButton = <HTMLButtonElement> event.target;
		editButton.disabled = true;

		this.hideTooltips();

		this.editing = true;
		this.editedText = this.message.text;

		const clickListener = (e: MouseEvent) => this.cancelEditing(e);
        document.addEventListener('mousedown', clickListener);

        this.globalClickListener = clickListener;
	}

	private postEditedMessage(event: Event) : void{
		document.removeEventListener('mousedown', this.globalClickListener);
		const editButton = <HTMLButtonElement> event.target;
		editButton.disabled = true;

        this.chatService.editMessage(this.editedText, this.message.messageId)
            .then(() => {
				this.editing = false;
				if (this.editedText != this.message.text) Toaster.showSuccess(`${t("course.feature.message.edited")}`);
				editButton.disabled = false;
            })
            .catch(error => {
                console.error(error);

                let errorMessage: string;

                if (error === "connection") {
                    errorMessage = t("course.feature.message.edit.error.connection");
                }
                else {
                    errorMessage = t("course.feature.message.edit.error");
                }

                Toaster.showError(errorMessage);

				editButton.disabled = false;
            });
	}

	private hideTooltips(): void {
        this.deleteTooltip?.hide();
        this.editTooltip?.hide();
    }

	private canReply(): boolean {
		if(this.editing || this.message.deleted) return false;

		if(!privilegeStore.canWriteMessages()) return false;
		if(ChatService.isPrivateMessage(this.message) && !privilegeStore.canWritePrivateMessages()) return false;
		if(ChatService.isMessageToOrganisers(this.message) && !privilegeStore.canWriteMessagesToOrganisators()) return false;

		return privilegeStore.canWriteMessagesToAll();
	}

	private cancelEditing(event: MouseEvent) : void {
		if(!this.chatMessageBoxed) return;

        const clickWithinMessageBox: boolean = ChatBoxMessage.isWithinRect(
			event.clientX, event.clientY,
			this.chatMessageBoxed.getBoundingClientRect())

		if(clickWithinMessageBox) {
			return;
		}

        this.editing = false;

        document.removeEventListener('mousedown', this.globalClickListener);
	}

	private static getMessageDate(message: ChatMessage) {
		return new Date(message.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	private static isWithinRect(actualX: number, actualY: number, target: DOMRect): boolean {
		return actualY >= target.top && actualY <= target.bottom && actualX >= target.left && actualX <= target.right
	}
}
