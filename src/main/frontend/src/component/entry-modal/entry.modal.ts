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
					<button type="button" @click="${this.close}" class="btn btn-outline-primary btn-sm">
						${t("entry.modal.start")}
					</button>
				</div>
			</sl-dialog>
		`;
	}
}