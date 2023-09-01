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

	protected override render() {
		return html`
			<sl-dialog label="${t("reconnect.title")}">
				<article>
					<span>${t("reconnect.description")}</span>
				</article>
				<div slot="footer">
					<sl-button type="button" @click="${this.abort}" variant="primary" size="small">
						${t("reconnect.abort")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}