import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("recorded-modal")
export class RecordedModal extends Modal {

	override render() {
		return html`
			<sl-dialog label="${t("course.recorded.modal.title")}">
				<article>
					<label class="form-label">${t("course.recorded.modal.message")}</label>
				</article>
				<div slot="footer">
					<sl-button @click="${this.close}" variant="primary" size="small">
						${t("course.recorded.modal.accept")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}