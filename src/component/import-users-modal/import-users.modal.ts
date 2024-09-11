import { columnBodyRenderer } from "@vaadin/grid/lit";
import { CSSResultGroup, html } from "lit";
import { customElement, state, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { CourseCsvUser } from "../../model/course-csv-user";
import { courseStore } from "../../store/course.store";
import { validateForm } from "../../utils/form";
import { Modal } from "../modal/modal";
import { t } from '../i18n-mixin';
import { Utils } from "../../utils/utils";
import styles from "./import-users-modal.css";

@customElement("import-users-modal")
export class ImportUsersModal extends Modal {

	static override styles = <CSSResultGroup>[
		Modal.styles,
		styles,
	];

	@query("#import-form")
	accessor form: HTMLFormElement;

	@state()
	accessor users: CourseCsvUser[];


	protected override render() {
		return html`
			<sl-dialog label="${t("import.users.title")}" style="--width: 50vw;">
				<article>
					<form id="import-form" class="validity-styles">
						<span class="help-text">${t("course.form.user.management.csv.help")}</span>
						<div class="assign-container">
							<sl-select name="user-role"
									   placeholder="${ t("course.form.user.management.role.placeholder") }"
									   label="${ t("course.form.user.management.role") }"
									   placement="bottom"
									   hoist
									   required>
								${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
									<sl-option value="${t(role.name)}">${t(role.description)}</sl-option>
								`)}
							</sl-select>
						</div>
						<data-table .items="${this.users}" pageSize="10">
							<data-table-column
								path="firstName"
								header="${t("course.form.user.management.first-name")}"
								auto-width>
							</data-table-column>
							<data-table-column
								path="familyName"
								header="${t("course.form.user.management.last-name")}"
								auto-width>
							</data-table-column>
							<data-table-column
								path="email"
								header="${t("course.form.user.management.mail")}"
								auto-width>
							</data-table-column>
							<data-table-column
								${columnBodyRenderer(this.buttonRenderer)}
							></data-table-column>
						</data-table>
					</form>
				</article>
				<div slot="footer">
					<sl-button type="button" @click="${this.abort}" size="small" form="import-form">
						${t("import.users.abort")}
					</sl-button>
					<sl-button type="button" @click="${this.import}" variant="primary" size="small">
						${t("import.users.import")}
					</sl-button>
				</div>
			</sl-dialog>
		`;
	}

	private onExcludeFromImport(user: CourseCsvUser) {
		this.users = this.users.filter(value => {
			return value.email !== user.email
		});
	}

	private abort() {
		this.dispatchEvent(Utils.createEvent("import-users-modal-abort"));

		super.close();
	}

	private import() {
		if (validateForm(this.form)) {
			const data = new FormData(this.form);
			const roleName = data.get("user-role") as string;
			const role = courseStore.findCourseRoleByName(roleName);
			if (!role) {
				return;
			}

			// Assign the selected role to imported users.
			this.users.forEach(user => {
				user.role = role;
			});

			this.dispatchEvent(Utils.createEvent("import-users-modal-import"));

			super.close();
		}
	}

	private buttonRenderer(user: CourseCsvUser) {
		return html`
			<div class="text-end">
				<sl-tooltip content="${t("course.form.user.management.delete")}" hoist>
					<sl-icon-button @click=${(): void => { this.onExcludeFromImport(user)}} name="course-delete" class="icon-danger"></sl-icon-button>
				</sl-tooltip>
			</div>
		`;
	}
}
