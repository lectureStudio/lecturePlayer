import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { MessageService } from "../../service/message.service";
import { chatModalStyles } from "./chat.modal.tyles";
import { ChatBox } from "../chat-box/chat-box";

@customElement("chat-modal")
export class ChatModal extends Modal {

	static styles = [
		Modal.styles,
		chatModalStyles
	];

	@property()
	messageService: MessageService;


	protected post() {
		const chatBox: ChatBox = this.shadowRoot.querySelector("chat-box");
		chatBox.send();
	}

	protected render() {
		return html`
			<sl-dialog noHeader>
				<article>
					<chat-box .messageService="${this.messageService}"></chat-box>
				</article>
				<div slot="footer">
					<sl-button @click="${this.close}" size="small">
						${t("course.feature.close")}
					</sl-button>
					<sl-button @click="${this.post}" variant="primary" size="small" id="message-submit" form="course-message-form">
						${t("course.feature.message.send")}
						<sl-icon library="lect-icons" name="send-message"></sl-icon>
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}