import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';

@customElement("participants-modal")
export class ParticipantsModal extends Modal {

	protected render() {
		return html`
			<sl-dialog label="${t("settings.title")}" noHeader>
				<article>
					<participants-box></participants-box>
				</article>
				<div slot="footer">
					<sl-button @click="${this.close}" size="small">
						${t("course.feature.close")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}
}