import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { Modal } from "../modal/modal";
import { t } from '../i18n-mixin';
import { Utils } from "../../utils/utils";

@customElement("reconnect-modal")
export class ReconnectModal extends Modal {

	private abort() {
		this.dispatchEvent(Utils.createEvent("reconnect-modal-abort"));

		super.close();
	}

	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("reconnect.title")}</span>
				</header>
				<article>
					<span>${t("reconnect.description")}</span>
				</article>
				<footer>
					<button type="button" @click="${this.abort}" class="btn btn-outline-primary btn-sm">
						${t("reconnect.abort")}
					</button>
				</footer>
			</web-dialog>
		`;
	}

}