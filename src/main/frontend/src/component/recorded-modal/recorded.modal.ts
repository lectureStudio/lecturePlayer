import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("recorded-modal")
export class RecordedModal extends Modal {

	render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<header>
					<span>${t("course.recorded.modal.title")}</span>
				</header>
				<article>
					<label class="form-label">
						${t("course.recorded.modal.message")}
					</label>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-primary btn-sm">
						${t("course.recorded.modal.accept")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}