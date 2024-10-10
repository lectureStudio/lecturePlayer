import { consume } from "@lit/context";
import { columnBodyRenderer } from "@vaadin/grid/lit";
import { CSSResultGroup, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { CourseFormContext, courseFormContext } from "../../context/course-form.context";
import { aliase, CourseAlias } from "../../model/course";
import { uiStateStore } from "../../store/ui-state.store";
import styles from "./course-access-form.css";
import contentStyles from "./course-form-content.css";

@customElement('course-access-form')
export class CourseAccessForm extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
		contentStyles
	];

	@consume({ context: courseFormContext })
	accessor formContext: CourseFormContext;

	@query("#description-editor")
	accessor editorDiv: HTMLElement;


	protected override render() {
		return html`
			<sl-input type="password" name="passcode" .value="${this.formContext.courseForm.passcode}" label="${t("course.form.access.passcode")}" help-text="${t("course.form.access.passcode.help")}" autocomplete="off" password-toggle></sl-input>

			<div>
				<label>${t("course.form.access.visibility")}</label>
				<sl-switch .checked="${this.formContext.courseForm.isHidden}" help-text="${t("course.form.access.visibility.help")}">${t("course.form.access.visibility.label")}</sl-switch>
			</div>

			<div>
				<label>${t("course.form.access.access-link")}</label>
				<span class="help-text">${t("course.form.access.access-link.description")}</span>
				
				<form id="alias-form" class="validity-styles">
					<div class="alias-container">
						<sl-input name="alias" label="${t("course.form.access.access-link.alias")}" help-text="${t("course.form.access.access-link.alias.help")}" autocomplete="off"></sl-input>
						<sl-input type="datetime-local" name="expiry" label="${t("course.form.access.access-link.expiry")}" help-text="${t("course.form.access.access-link.expiry.help")}" autocomplete="off"></sl-input>
						<sl-button @click="${this.onCreateAlias}">
							${t("course.form.access.access-link.create")}
						</sl-button>
					</div>
				</form>
	
				<data-table .items="${aliase}">
					<data-table-column
						header="${t("course.form.access.access-link.alias")}"
						flex-grow="0"
						auto-width
						${columnBodyRenderer(this.aliasUrlRenderer)}>
					</data-table-column>
					<data-table-column
						flex-grow="0"
						${columnBodyRenderer(this.aliasTypeRenderer)}>
					</data-table-column>
					<data-table-column
						header="${t("course.form.access.access-link.expiry")}"
						auto-width
						${columnBodyRenderer(this.aliasExpiryRenderer)}>
					</data-table-column>
					<data-table-column
						flex-grow="0"
						auto-width
						${columnBodyRenderer(this.aliasButtonRenderer)}>
					</data-table-column>
				</data-table>
			</div>
		`;
	}

	private aliasUrlRenderer(alias: CourseAlias) {
		return html`<a href="${alias.url}" target="_blank">${alias.name}</a>`;
	}

	private aliasTypeRenderer(alias: CourseAlias) {
		return html`
			${when(alias.isDefault, () => html`
				<sl-tooltip content="${ t("course.form.access.access-link.default.help") }">
					<sl-badge variant="neutral">${ t("course.form.access.access-link.default") }</sl-badge>
				</sl-tooltip>
			`)}
		`;
	}

	private aliasExpiryRenderer(alias: CourseAlias) {
		return html`
			${when(alias.expiry !== undefined,
				() => html`
					<sl-format-date
						month="long" day="numeric" year="numeric" hour="numeric" minute="numeric" hour-format="24"
						date="${alias.expiry ?? ""}" lang="${uiStateStore.language}">
					</sl-format-date>
				`,
				() => html`
					<sl-badge variant="warning">${t("course.form.access.access-link.expiry.never")}</sl-badge>
				`,
			)}
		`;
	}

	private aliasButtonRenderer(alias: CourseAlias) {
		return html`
			<div class="text-end">
				${when(!alias.isDefault, () => html`
					<sl-tooltip content="${ t("course.form.access.access-link.delete") }">
						<sl-icon-button @click=${ (): void => {
							this.onDeleteAlias(alias)
						} } name="course-delete" class="icon-danger"></sl-icon-button>
					</sl-tooltip>
				`)}

				<sl-copy-button
					value="${ alias.url }"
					copy-label="${ t("course.form.access.access-link.copy") }"
					success-label="${ t("label.success") }"
					error-label="${ t("label.error") }">
				</sl-copy-button>
			</div>
		`;
	}

	private onCreateAlias() {

	}

	private onDeleteAlias(alias: CourseAlias) {

	}
}
