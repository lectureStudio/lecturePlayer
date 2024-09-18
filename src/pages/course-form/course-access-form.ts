import { CSSResultGroup, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { when } from "lit/directives/when.js";
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
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

	@query("#description-editor")
	accessor editorDiv: HTMLElement;


	protected override firstUpdated() {

	}

	protected override render() {
		return html`
			<form class="validity-styles">
				<sl-input type="password" name="passcode" label="${t("course.form.access.passcode")}" help-text="${t("course.form.access.passcode.help")}" autocomplete="off" password-toggle></sl-input>

				<label>${t("course.form.access.visibility")}</label>
				<sl-switch help-text="${t("course.form.access.visibility.help")}">${t("course.form.access.visibility.label")}</sl-switch>

				<label>${t("course.form.access.access-link")}</label>
				<span class="help-text">${t("course.form.access.access-link.description")}</span>

				<div class="alias-container">
					<sl-input name="alias" label="${t("course.form.access.access-link.alias")}" help-text="${t("course.form.access.access-link.alias.help")}" autocomplete="off"></sl-input>
					<sl-input type="datetime-local" name="expiry" label="${t("course.form.access.access-link.expiry")}" help-text="${t("course.form.access.access-link.expiry.help")}" autocomplete="off"></sl-input>
					<sl-button @click="${this.onCreateAlias}">
						${t("course.form.access.access-link.create")}
					</sl-button>
				</div>

				<table>
					<thead>
						<tr>
							<th>${t("course.form.access.access-link.alias")}</th>
							<th></th>
							<th>${t("course.form.access.access-link.expiry")}</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						${repeat(aliase, (alias) => alias.name, (alias) => html`
							<tr>
								<td class="fit-width">
									<a href="${alias.url}">${alias.name}</a>
								</td>
								<td class="fit-width">
									${when(alias.isDefault, () => html`
										<sl-tooltip content="${t("course.form.access.access-link.default.help")}">
											<sl-badge variant="neutral">${t("course.form.access.access-link.default")}</sl-badge>
										</sl-tooltip>
									`)}
								</td>
								<td>
									${when(alias.expiry !== undefined,
										() => html`
											<sl-format-date
												month="long" day="numeric" year="numeric" hour="numeric" minute="numeric" hour-format="24"
												date="${alias.expiry ?? ""}" lang="${uiStateStore.language}">
											</sl-format-date>
										`,
										() => html`
											<sl-badge variant="warning">${t("course.form.access.access-link.expiry.never")}</sl-badge>
										`
									)}
								</td>
								<td class="fit-width, text-end">
									${when(!alias.isDefault, () => html`
										<sl-tooltip content="${t("course.form.access.access-link.delete")}">
											<sl-icon-button @click=${(): void => { this.onDeleteAlias(alias) }} name="course-delete" class="icon-danger"></sl-icon-button>
										</sl-tooltip>
									`)}

									<sl-copy-button
										value="${alias.url}"
										copy-label="${t("course.form.access.access-link.copy")}"
										success-label="${t("label.success")}"
										error-label="${t("label.error")}">
									</sl-copy-button>
								</td>
							</tr>
						`)}
					</tbody>
				</table>
			</form>
		`;
	}

	private onCreateAlias() {

	}

	private onDeleteAlias(alias: CourseAlias) {

	}
}
