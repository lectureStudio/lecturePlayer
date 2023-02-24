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
			<sl-dialog label="${t("settings.title")}" noHeader>
				<article>
					<participants-box .privilegeService="${this.privilegeService}"></participants-box>
				</article>
				<div slot="footer">
					<button type="button" @click="${this.close}" class="btn btn-outline-secondary btn-sm">
						${t("course.feature.close")}
					</button>
				</div>
			</sl-dialog>
		`;
	}
}