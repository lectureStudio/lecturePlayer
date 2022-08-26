import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { MessageService } from "../../service/message.service";
import { PrivilegeService } from "../../service/privilege.service";
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

	@property()
	privilegeService: PrivilegeService;


	protected post() {
		const chatBox: ChatBox = this.shadowRoot.querySelector("chat-box");
		chatBox.send();
	}

	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<article>
					<chat-box .messageService="${this.messageService}" .privilegeService="${this.privilegeService}"></chat-box>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
					<button type="button" @click="${this.post}" class="btn btn-outline-primary btn-sm" id="message-submit" form="course-message-form">
						${t("course.feature.message.send")}
						<span class="icon-send"></span>
					</button>
				</footer>
			</web-dialog>
		`;
	}
}