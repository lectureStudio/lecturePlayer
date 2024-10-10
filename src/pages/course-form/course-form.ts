import { provide } from "@lit/context";
import { CSSResultGroup, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { autorun, observable } from "mobx";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { courseFormContext, CourseFormContext } from "../../context/course-form.context";
import styles from "./course-form.css";

@customElement('course-form')
export class CourseForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@provide({ context: courseFormContext })
	@property({ attribute: false })
	@observable
	accessor courseFormContext: CourseFormContext;


	override firstUpdated() {
		autorun(() => {
			console.log("form", this.courseFormContext?.courseForm)
		});
	}

	protected override render() {
		return html`
			<div class="form-container">
				<sl-tab-group>
					<sl-tab slot="nav" panel="description">${t("course.form.description")}</sl-tab>
					<sl-tab slot="nav" panel="access">${t("course.form.access")}</sl-tab>
					<sl-tab slot="nav" panel="roles">${t("course.form.roles")}</sl-tab>
					<sl-tab slot="nav" panel="user-management">${t("course.form.user.management")}</sl-tab>

					<sl-tab-panel name="description">
						<course-description-form></course-description-form>
					</sl-tab-panel>
					<sl-tab-panel name="access">
						<course-access-form></course-access-form>
					</sl-tab-panel>
					<sl-tab-panel name="roles">
						<course-roles-form></course-roles-form>
					</sl-tab-panel>
					<sl-tab-panel name="user-management">
						<course-users-form></course-users-form>
					</sl-tab-panel>
				</sl-tab-group>

				<div class="form-footer">
					<sl-button @click="${this.onSaveCourse}" type="submit" size="small">
						<sl-icon slot="prefix" name="save"></sl-icon>
						${t("course.form.save")}
					</sl-button>
				</div>
			</div>
		`;
	}

	private onSaveCourse() {

	}
}
