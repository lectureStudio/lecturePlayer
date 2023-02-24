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
			<sl-dialog label="${t("reconnect.title")}">
				<article>
					<span>${t("reconnect.description")}</span>
				</article>
				<div slot="footer">
					<button type="button" @click="${this.abort}" class="btn btn-outline-primary btn-sm">
						${t("reconnect.abort")}
					</button>
				</div>
			</sl-dialog>
		`;
	}
}