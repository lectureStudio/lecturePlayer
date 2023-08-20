import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { ChatService } from "../../service/chat.service";
import chatModalStyles from "./chat.modal.scss";

@customElement("chat-modal")
export class ChatModal extends Modal {

	static styles = [
		Modal.styles,
		chatModalStyles
	];

	@property()
	messageService: ChatService;


	protected render() {
		return html`
			<sl-dialog label="${t("course.feature.message")}">
				<article>
					<chat-box .messageService="${this.messageService}"></chat-box>
				</article>
			</sl-dialog>
		`;
	}
}