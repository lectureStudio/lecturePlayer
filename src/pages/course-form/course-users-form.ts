import { consume } from "@lit/context";
import { columnBodyRenderer } from "@vaadin/grid/lit";
import { CSSResultGroup, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { ImportUsersModal } from "../../component";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { CourseManagedUser } from "../../model/course";
import { CourseCsvUser } from "../../model/course-csv-user";
import { courseStore } from "../../store/course.store";
import { parseCsvFile } from "../../utils/csv";
import { validateForm } from "../../utils/form";
import contentStyles from "./course-form-content.css";
import styles from "./course-users-form.css";

@customElement('course-users-form')
export class CourseUsersForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
		contentStyles
	];

	@consume({ context: applicationContext })
	accessor applicationContext: ApplicationContext;

	@query("#selectCsvFileInput")
	accessor fileInput: HTMLInputElement;

	@query("#assign-form")
	accessor assignForm: HTMLFormElement;

	@state()
	private accessor managedUsers: CourseManagedUser[] = [];


	protected override firstUpdated() {
		// Register 'file opened' listener.
		this.fileInput.addEventListener("change", () => {
			if (this.fileInput.files) {
				parseCsvFile(this.fileInput.files[0])
					.then(users => this.openUsersModal(users))
					.catch(reason => console.error(reason));

				// Clear input.
				this.fileInput.value = "";
			}
		});
	}

	protected override render() {
		return html`
			<span class="help-text">${t("course.form.user.management.help")}</span>

			<div class="button-group-toolbar">
				<input type="file" id="selectCsvFileInput" accept=".csv"/>
				<sl-button-group label="CSV">
					<sl-button @click="${this.onImportCSV}" size="small">
						<sl-icon slot="prefix" name="import"></sl-icon>
						${t("course.form.user.management.csv.import")}
					</sl-button>
					<sl-button @click="${this.onDeleteCSVImport}" size="small">
						<sl-icon slot="prefix" name="course-delete"></sl-icon>
						${t("course.form.user.management.csv.import.delete")}
					</sl-button>
				</sl-button-group>
			</div>

			<form id="assign-form" class="validity-styles">
				<div class="assign-container">
					<sl-input type="email" name="user-email" placeholder="${t("course.form.user.management.mail.placeholder")}" label="${t("course.form.user.management.mail")}" required></sl-input>
					<sl-select name="user-role" placeholder="${t("course.form.user.management.role.placeholder")}" label="${t("course.form.user.management.role")}" placement="bottom" hoist required>
						${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
							<sl-option value="${t(role.name)}">${t(role.description)}</sl-option>
						`)}
					</sl-select>
					<sl-button @click="${this.onAssignNewUser}">
						${t("course.form.user.management.assign")}
					</sl-button>
				</div>
			</form>

			<data-table .items="${this.managedUsers}" pageSize="5">
				<data-table-column
					path="user.email"
					header="${t("course.form.user.management.mail")}"
					auto-width>
				</data-table-column>
				<data-table-column
					header="${t("course.form.user.management.name")}"
					${columnBodyRenderer(this.userTableNameRenderer)}
					auto-width>
				</data-table-column>
				<data-table-column
					header="${t("course.form.user.management.role")}"
					${columnBodyRenderer(this.userTableRoleRenderer)}
					auto-width>
				</data-table-column>
				<data-table-column
					${columnBodyRenderer(this.userTableButtonRenderer)}>
				</data-table-column>
			</data-table>
		`;
	}

	private userTableNameRenderer(managedUser: CourseManagedUser) {
		return `${managedUser.user.firstName} ${managedUser.user.familyName}`;
	}

	private userTableRoleRenderer(managedUser: CourseManagedUser) {
		return t(managedUser.role.description);
	}

	private userTableButtonRenderer(managedUser: CourseManagedUser) {
		return html`
			<div class="text-end">
				<sl-tooltip content="${t("course.form.user.management.delete")}">
					<sl-icon-button @click=${(): void => { this.onDeleteAssignment(managedUser) }} name="course-delete" class="icon-danger"></sl-icon-button>
				</sl-tooltip>
				<sl-tooltip
					content="${t(managedUser.blocked ? "course.form.user.management.unblock" : "course.form.user.management.block")}">
					<sl-icon-button @click=${(): void => { this.onChangeUserBlock(managedUser) }} name="${managedUser.blocked ? "person-unblock" : "person-block"}"></sl-icon-button>
				</sl-tooltip>
			</div>
		`;
	}

	private openUsersModal(users: CourseCsvUser[]) {
		const importModal = new ImportUsersModal();
		importModal.users = users;
		importModal.addEventListener("import-users-modal-import", () => {
			// Convert imported users to managed users.
			this.managedUsers = this.managedUsers.concat(importModal.users.map(user => {
				return {
					user: {
						userId: "",
						firstName: user.firstName,
						familyName: user.familyName,
						email: user.email,
					},
					role: user.role,
					blocked: false
				} as CourseManagedUser
			}));
		});

		this.applicationContext.modalController.registerModal("ImportUsersModal", importModal);
	}

	private onAssignNewUser() {
		if (validateForm(this.assignForm)) {
			const data = new FormData(this.assignForm);

		}
	}

	private onDeleteAssignment(managedUser: CourseManagedUser) {

	}

	private onChangeUserBlock(managedUser: CourseManagedUser) {

	}

	private onImportCSV() {
		// Trigger the file input click event
		this.fileInput.click();
	}

	private onDeleteCSVImport() {

	}
}
