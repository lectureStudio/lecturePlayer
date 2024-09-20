import { GridColumn } from "@vaadin/grid/all-imports";
import { columnBodyRenderer } from "@vaadin/grid/lit";
import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import { CSSResultGroup, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { CoursePrivilege, coursePrivileges, CourseRole } from "../../model/course";
import { courseStore } from "../../store/course.store";
import styles from "./course-roles-form.css";
import contentStyles from "./course-form-content.css";

@customElement('course-roles-form')
export class CourseRolesForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
		contentStyles,
	];

	@query("#description-editor")
	accessor editorDiv: HTMLElement;

	private readonly coursePrivileges: CoursePrivilege[]


	constructor() {
		super();

		this.coursePrivileges = coursePrivileges.sort((a, b) => a.order - b.order);
	}

	protected override render() {
		return html`
			<data-table .items="${this.coursePrivileges}">
				<data-table-column
					header="${t("course.privilege")}"
					flex-grow="0"
					auto-width
					${columnBodyRenderer(this.privilegeDescriptionRenderer)}>
				</data-table-column>

				${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
					<data-table-column
						header="${t(role.description)}"
						text-align="center"
						flex-grow="0"
						auto-width
						${columnBodyRenderer(this.privilegeCheckboxRenderer)}>
					</data-table-column>
				`)}
			</data-table>
		`;
	}

	private privilegeDescriptionRenderer(privilege: CoursePrivilege) {
		return html`<span class="text-small">${t(privilege.description)}</span>`;
	}

	private privilegeCheckboxRenderer(role: CourseRole, model: GridItemModel<CourseRole>, column: GridColumn) {
		return html`<sl-checkbox></sl-checkbox>`;
	}
}
