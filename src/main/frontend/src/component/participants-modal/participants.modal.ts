import { html } from "lit";
import { Modal } from "../modal/modal";
import { customElement, property } from "lit/decorators.js";
import { t } from '../i18n-mixin';
import { PrivilegeService } from "../../service/privilege.service";

@customElement("participants-modal")
export class ParticipantsModal extends Modal {

	@property()
	privilegeService: PrivilegeService;


	protected render() {
		return html`
			<web-dialog @open="${this.opened}" ?open="${this.show}" @close="${this.closed}" @closing="${this.closing}">
				<article>
					<participants-box></participants-box>
				</article>
				<footer>
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
				</footer>
			</web-dialog>
		`;
	}
}