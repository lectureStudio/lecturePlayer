import { consume } from "@lit/context";
import { CSSResultGroup, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { ImportUsersModal } from "../../component";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { CourseManagedUser, CourseRole, courseRoles, managedUsers } from "../../model/course";
import { parseCsvFile } from "../../utils/csv";
import styles from "./course-users-form.css";
import contentStyles from "./course-form-content.css";

import "@vaadin/grid";
// import '@vaadin/vaadin-grid/vaadin-grid';
// import '@vaadin/vaadin-grid/vaadin-grid-column';
// import '@vaadin/vaadin-grid/theme/lumo/vaadin-grid.js';

interface Person {
	firstName: string;
	lastName: string;
	email: string;
	profession: string;
}

@customElement('course-users-form')
export class CourseUsersForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
		contentStyles
	];

	@consume({ context: applicationContext })
	accessor applicationContext: ApplicationContext;

	@query("#description-editor")
	accessor editorDiv: HTMLElement;

	@query("#selectCsvFileInput")
	accessor fileInput: HTMLInputElement;

	@query("#user-table")
	accessor userTable: HTMLTableElement;

	private readonly courseRoles: CourseRole[];

	@state()
	private accessor items: Person[] = [
		{
			firstName: "John",
			lastName: "Doe",
			email: "john.doe@mail.com",
			profession: "Agent",
		},
		{
			firstName: "Max",
			lastName: "Mustermann",
			email: "max.muster@test.de",
			profession: "Muster",
		},
	];


	constructor() {
		super();

		this.courseRoles = courseRoles.sort((a, b) => a.order - b.order);
	}

	protected override firstUpdated() {
		this.fileInput.addEventListener("change", () => {
			if (this.fileInput.files) {
				// Clear input.
				this.fileInput.value = "";

				parseCsvFile(this.fileInput.files[0]);

				const importModal = new ImportUsersModal();
				importModal.addEventListener("import-users-modal-import", () => {

				});

				this.applicationContext.modalController.registerModal("ImportUsersModal", importModal);
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

			<vaadin-grid .items="${this.items}">
				<vaadin-grid-column path="firstName"></vaadin-grid-column>
				<vaadin-grid-column path="lastName"></vaadin-grid-column>
				<vaadin-grid-column path="email"></vaadin-grid-column>
				<vaadin-grid-column path="profession"></vaadin-grid-column>
			</vaadin-grid>

			<div class="assign-container">
				<sl-input type="email" name="user-email" placeholder="${t("course.form.user.management.mail.placeholder")}" label="${t("course.form.user.management.mail")}" required></sl-input>
				<sl-select name="user-role" placeholder="${t("course.form.user.management.role.placeholder")}" label="${t("course.form.user.management.role")}" placement="bottom" hoist required>
					${repeat(this.courseRoles, (role) => role.name, (role) => html`
						<sl-option value="${t(role.name)}">${t(role.description)}</sl-option>
					`)}
				</sl-select>
				<sl-button @click="${this.onAssignUser}">
					${t("course.form.user.management.assign")}
				</sl-button>
			</div>

			<table id="user-table">
				<thead>
					<tr>
						<th>${t("course.form.user.management.mail")}</th>
						<th>${t("course.form.user.management.name")}</th>
						<th>${t("course.form.user.management.role")}</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					${repeat(managedUsers, (managedUser) => managedUser.user.userId, (managedUser) => html`
						<tr>
							<td>${managedUser.user.email}</td>
							<td>${managedUser.user.firstName} ${managedUser.user.familyName}</td>
							<td>${t(managedUser.role.description)}</td>
							<td class="fit-width, text-end">
								<sl-tooltip content="${t("course.form.user.management.delete")}">
									<sl-icon-button @click=${(): void => { this.onDeleteAssignment(managedUser) }} name="course-delete" class="icon-danger"></sl-icon-button>
								</sl-tooltip>
								<sl-tooltip content="${t(managedUser.blocked ? "course.form.user.management.unblock" : "course.form.user.management.block")}">
									<sl-icon-button @click=${(): void => { this.onChangeUserBlock(managedUser) }} name="${managedUser.blocked ? "person-unblock" : "person-block"}" class="change-block-icon"></sl-icon-button>
								</sl-tooltip>
							</td>
						</tr>
					`)}
				</tbody>
			</table>
		`;
	}

	private onAssignUser() {

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
