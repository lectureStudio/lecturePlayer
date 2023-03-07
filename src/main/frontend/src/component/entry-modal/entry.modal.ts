import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("entry-modal")
export class EntryModal extends Modal {

	protected render() {
		return html`
			<sl-dialog label="${t("entry.modal.title")}">
				<article>
					<span>${t("entry.modal.description")}</span>
				</article>
				<div slot="footer">
					<sl-button @click="${this.close}" variant="primary" size="small">
						${t("entry.modal.start")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}