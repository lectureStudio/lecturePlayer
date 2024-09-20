import { serialize, SlChangeEvent } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { CourseManagedUser } from "../../model/course";
import { CourseCsvUser } from "../../model/course-csv-user";
import { courseStore } from "../../store/course.store";
import { validateForm } from "../../utils/form";
import { Modal } from "../modal/modal";
import { t } from '../i18n-mixin';
import { Utils } from "../../utils/utils";

@customElement("assign-role-modal")
export class AssignRoleModal extends Modal {

	@query("#assign-form")
	accessor form: HTMLFormElement;

	@state()
	accessor users: CourseCsvUser[];

	@state()
	private accessor inviteGuest: boolean = false;


	protected override render() {
		return html`
			<sl-dialog label="${t("course.form.user.management.role.assign")}">
				<article>
					<form id="assign-form" class="validity-styles">
						<span class="help-text">${t("course.form.user.management.help")}</span>
						<sl-checkbox ?checked="${this.inviteGuest}" @sl-change="${this.onInviteGuestChange}" help-text="${t("course.form.user.management.guest.help")}">${t("course.form.user.management.guest")}</sl-checkbox>
						<div class="assign-container">
							<sl-input type="email" name="email" placeholder="${t("course.form.user.management.mail.placeholder")}" label="${t("course.form.user.management.mail")}" required></sl-input>

							${when(this.inviteGuest, () => html`
								<sl-input name="firstName" label="${t("course.form.user.management.first-name")}" required></sl-input>
								<sl-input name="lastName" label="${t("course.form.user.management.last-name")}" required></sl-input>
							`)}

							<sl-select name="role" placeholder="${t("course.form.user.management.role.placeholder")}" label="${t("course.form.user.management.role")}" placement="bottom" hoist required>
								${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
									<sl-option value="${t(role.name)}">${t(role.description)}</sl-option>
								`)}
							</sl-select>
						</div>
					</form>
				</article>
				<div slot="footer">
					<sl-button type="button" @click="${this.abort}" size="small" form="import-form">
						${t("button.cancel")}
					</sl-button>
					<sl-button type="button" @click="${this.onAssignNewUser}" variant="primary" size="small">
						${t("course.form.user.management.assign")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}

	private onInviteGuestChange(event: SlChangeEvent & { target: HTMLInputElement }) {
		this.inviteGuest = event.target.checked;
	}

	private onAssignNewUser() {
		if (validateForm(this.form)) {
			const managedUser = serialize(this.form) as CourseManagedUser;

			console.log(managedUser);

			this.dispatchEvent(Utils.createEvent("assign-role-modal-success"));

			super.close();
		}
	}

	private abort() {
		this.dispatchEvent(Utils.createEvent("assign-role-modal-abort"));

		super.close();
	}
}
