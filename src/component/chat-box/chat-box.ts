import { Component } from '../component';
import { CSSResultGroup, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { when } from 'lit/directives/when.js';
import { repeat } from 'lit/directives/repeat.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { ChatService} from '../../service/chat.service';
import { ChatBoxMessage } from './chat-message';
import { privilegeStore } from '../../store/privilege.store';
import { chatStore } from '../../store/chat.store';
import { Utils } from '../../utils/utils';
import { Toaster } from '../../utils/toaster';
import { ChatForm } from '../chat-form/chat-form';
import chatBoxStyles from './chat-box.css';

@customElement('chat-box')
export class ChatBox extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		chatBoxStyles,
	];

	@property({ attribute: false })
	accessor chatService: ChatService;

	@query(".chat-history-log")
	accessor messageContainer: HTMLElement;

	@query("chat-form")
	accessor chatForm: ChatForm;

	messageObserver: IntersectionObserver;

	visibilityObserver: IntersectionObserver;

	mutationObserver: MutationObserver;


	override connectedCallback() {
		super.connectedCallback();

		// Observe the message container and register added message elements for visibility observation.
		this.mutationObserver = new MutationObserver(this.onMessageContainerMutation.bind(this));

		// Get notified whenever a message element is hidden or gets visible to the user.
		this.messageObserver = new IntersectionObserver(this.onMessageIntersection.bind(this), {
			root: null,
			threshold: 0.9	// When 90% of content is visible to the user.
		});

		this.visibilityObserver = new IntersectionObserver(this.onVisibility.bind(this), {
			threshold: 0.9
		});
		this.visibilityObserver.observe(this);
	}

	override disconnectedCallback() {
		this.mutationObserver.disconnect();
		this.messageObserver.disconnect();
		this.visibilityObserver.disconnect();

		super.disconnectedCallback();
	}

	send() {
		const sendButton: HTMLButtonElement | null = this.renderRoot.querySelector("#message-submit");

		if (!sendButton) {
			throw new Error("Send button is null");
		}

		sendButton.click();
	}

	protected override firstUpdated(): void {
		this.mutationObserver.observe(this.messageContainer, { childList: true });

		// Mark already added messages as read and set their chatForm property.
		for (const child of this.messageContainer.children) {
			(child as ChatBoxMessage).message.read = true;
			(child as ChatBoxMessage).chatForm = this.chatForm;
		}
	}

	protected post(event: Event): void {
		const submitButton = <HTMLButtonElement> event.target;
		submitButton.disabled = true;

		const chatForm: ChatForm | null = this.renderRoot.querySelector("chat-form");

		if (!chatForm) {
			throw new Error("Form is null");
		}

		const msgToReplyTo: string | undefined = chatForm.replying ? chatForm.getMessageToReplyTo() : undefined;
		this.chatService.postMessage(chatForm.getFormData(), msgToReplyTo)
			.then(() => {
				Toaster.showSuccess(`${t("course.feature.message.sent")}`);

				// Reset form only on success.
				chatForm.resetForm();
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
				chatForm.notifyAboutMessageSending();
			});
	}

	protected override render() {
		return html`
			<header part="header">
				${t("course.feature.message")}
			</header>

			<section part="section">
				<div class="chat-history">
					<div class="chat-history-log">
					${when(privilegeStore.canReadMessages(), () => html`
						${repeat(chatStore.messages, (message) => message.messageId, (message) => html`
							${when(!message.deleted, () => html`
								<chat-box-message .message="${message}" .chatService="${this.chatService}" .chatForm="${this.renderRoot.querySelector<ChatForm>("chat-form")}"></chat-box-message>
							`)}
						`)}
					`)}
					</div>
				</div>
			</section>

			<footer part="footer">
				${when(privilegeStore.canWriteMessages(), () => html`
				<chat-form id="chat-form" .chatService="${this.chatService}">
					<sl-button slot="right-pane" @click="${this.post}" type="submit" form="course-message-form" id="message-submit" size="medium" circle>
						<sl-icon name="send"></sl-icon>
					</sl-button>
				</chat-form>
				`)}
			</footer>
		`;
	}

	private onMessageContainerMutation(mutations: MutationRecord[]) {
		for (const mutation of mutations) {
			if (mutation.type === "childList") {
				// Observe added message elements for visibility.
				for (const node of mutation.addedNodes) {
					if (node instanceof ChatBoxMessage) {
						this.messageObserver.observe(node);
					}
				}

				// Unobserve removed message elements.
				for (const node of mutation.removedNodes) {
					if (node instanceof ChatBoxMessage) {
						this.messageObserver.unobserve(node);
					}
				}
			}
		}
	}

	private onMessageIntersection(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				// The Message is visible to the user. Mark it as read.
				const message = (entry.target as ChatBoxMessage).message;
				message.read = true;

				// Not necessary to observe anymore.
				this.messageObserver.unobserve(entry.target);
			}
			else {
				// The Message was added to the container but is not visible.
				if (chatStore.unreadMessages < 2) {
					// Show the recent message only if there are no other unread messages left.
					this.messageContainer.scrollTo({ top: this.messageContainer.scrollHeight, left: 0, behavior: "smooth" });
				}
			}
		}
	}

	private onVisibility(entries: IntersectionObserverEntry[]) {
		for (const entry of entries) {
			this.dispatchEvent(Utils.createEvent("chat-visibility", {
				visible: entry.isIntersecting
			}));
		}
	}
}
