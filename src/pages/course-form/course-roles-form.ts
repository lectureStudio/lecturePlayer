import { CSSResultGroup, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { CoursePrivilege, coursePrivileges } from "../../model/course";
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
			<table>
				<thead>
					<tr>
						<th class="fit-width">${t("course.privilege")}</th>
	
						${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
							<th class="fit-width">${t(role.description)}</th>
						`)}
					</tr>
				</thead>
				<tbody>
					${repeat(this.coursePrivileges, (privilege) => privilege.name, (privilege) => html`
						<tr>
							<td class="fit-width">
								${t(privilege.description)}
							</td>

							${repeat(courseStore.courseRoles, (role) => role.name, (role) => html`
								<td class="fit-width, text-center">
									<sl-checkbox></sl-checkbox>
								</td>
							`)}
						</tr>
					`)}
				</tbody>
			</table>
		`;
	}

}
