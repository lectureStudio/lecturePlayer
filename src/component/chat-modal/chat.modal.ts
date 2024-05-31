import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { ChatService } from "../../service/chat.service";
import chatModalStyles from "./chat.modal.css";

@customElement("chat-modal")
export class ChatModal extends Modal {

	static override styles = [
		Modal.styles,
		chatModalStyles
	];

	@property({ attribute: false })
	accessor chatService: ChatService;


	protected override render() {
		return html`
			<sl-dialog label="${t("course.feature.message")}">
				<article>
					<chat-box .chatService="${this.chatService}"></chat-box>
				</article>
			</sl-dialog>
		`;
	}
}
