import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { ModerationService } from "../../service/moderation.service";
import participantsModalStyles from "./participants.modal.css";

@customElement("participants-modal")
export class ParticipantsModal extends Modal {

	static override styles = [
		Modal.styles,
		participantsModalStyles
	];

	@property()
	moderationService: ModerationService;


	protected override render() {
		return html`
			<sl-dialog label="${t("course.participants")}" noHeader>
				<article>
					<participant-list .moderationService="${this.moderationService}"></participant-list>
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
