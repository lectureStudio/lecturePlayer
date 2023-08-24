import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import participantsModalStyles from "./participants.modal.scss";

@customElement("participants-modal")
export class ParticipantsModal extends Modal {

	static styles = [
		Modal.styles,
		participantsModalStyles
	];


	protected render() {
		return html`
			<sl-dialog label="${t("settings.title")}" noHeader>
				<article>
					<participant-list></participant-list>
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