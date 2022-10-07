import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("entry-modal")
export class EntryModal extends Modal {

	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("entry.modal.title")}</span>
				</header>
				<article>
				<span>${t("entry.modal.description")}</span>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-primary btn-sm">
						${t("entry.modal.start")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}