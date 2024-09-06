import { Router } from "@vaadin/router";
import { t } from "i18next";
import { CSSResultGroup, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { when } from "lit/directives/when.js";
import { Course, CourseAuthor } from "../../model/course";
import { Component } from "../component";
import { I18nLitElement } from "../i18n-mixin";
import styles from './course-list-item.css';

@customElement('course-list-item')
export class CourseListItem extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@property({ type: Object })
	accessor course: Course;


	protected override render() {
		return html`
			<div class="course-item-header">
				<span class="course-title">${ this.course.title }</span>
				<div class="course-state">
					<sl-button-group label="editing">

						<sl-tooltip content="${t("course.list.edit")}">
							<sl-button @click="${this.onEditCourse}" size="small" class="button-edit"><sl-icon name="course-edit"></sl-icon></sl-button>
						</sl-tooltip>


						<sl-tooltip content="${t("course.list.delete")}">
							<sl-button @click="${this.onDeleteCourse}" size="small" class="button-delete"><sl-icon name="course-delete"></sl-icon></sl-button>
						</sl-tooltip>

					</sl-button-group>
					<sl-button-group label="features">
						${when(this.course.isProtected, () => html`
							<sl-tooltip content="${t("course.list.protected")}">
								<sl-button size="small" disabled><sl-icon name="course-lock"></sl-icon></sl-button>
							</sl-tooltip>
						`)}
						${when(this.course.messageFeature, () => html`
							<sl-tooltip content="${t("course.list.chat")}">
								<sl-button size="small" disabled><sl-icon name="course-chat"></sl-icon></sl-button>
							</sl-tooltip>
						`)}
						${when(this.course.quizFeature, () => html`
							<sl-tooltip content="${t("course.list.quiz")}">
								<sl-button size="small" disabled><sl-icon name="course-quiz"></sl-icon></sl-button>
							</sl-tooltip>
						`)}
						${when(this.course.isLive, () => html`
							<sl-tooltip content="${t("course.list.live")}">
								<sl-button size="small" disabled><sl-icon name="course-live"></sl-icon></sl-button>
							</sl-tooltip>
						`)}
					</sl-button-group>
				</div>
			</div>
			<span class="course-authors">${ t("course.list.authors", { authors: this.toAuthorsString(this.course.authors) }) }</span>
			<sl-details
				@click=${(e: MouseEvent): void => { e.stopImmediatePropagation() }}
				summary="${ t("course.list.description") }">
					${ unsafeHTML(this.course.description) }
			</sl-details>
		`;
	}

	private onDeleteCourse(e: MouseEvent): void {
		e.stopImmediatePropagation();


	}

	private onEditCourse(e: MouseEvent): void {
		e.stopImmediatePropagation();

		// Navigate to the course page.
		Router.go(`/course/edit/${this.course.defaultAccessLink}`);
	}

	private toAuthorsString(authors: CourseAuthor[]): string {
		return authors.map(author => author.firstName + " " + author.familyName).join(", ");
	}
}
