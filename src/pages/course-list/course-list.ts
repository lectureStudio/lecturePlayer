import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { Component } from "../../component/component";
import { I18nLitElement } from "../../component/i18n-mixin";
import { t } from "i18next";
import { Course, CourseAuthor } from "../../model/course";
import { courseStore } from "../../store/course.store";
import style from './course-list.css';

@customElement('course-list')
export class CourseList extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		style,
	];


	protected override render() {
		return html`
			<div class="course-container">
				${repeat(courseStore.courses, (course) => course.courseId, (course) => html`
					<div class="course-item" @click=${(): void => { this.selectCourse(course) }}>
						<div class="course-item-header">
							<span class="course-title">${ course.title }</span>
							<sl-button-group label="features">
								<sl-tooltip content="${t("course.list.protected")}">
									<sl-button size="small" disabled><sl-icon name="course-lock"></sl-icon></sl-button>
								</sl-tooltip>
								<sl-tooltip content="${t("course.list.chat")}">
									<sl-button size="small" disabled><sl-icon name="course-chat"></sl-icon></sl-button>
								</sl-tooltip>
								<sl-tooltip content="${t("course.list.quiz")}">
									<sl-button size="small" disabled><sl-icon name="course-quiz"></sl-icon></sl-button>
								</sl-tooltip>
								<sl-tooltip content="${t("course.list.live")}">
									<sl-button size="small" disabled><sl-icon name="course-live"></sl-icon></sl-button>
								</sl-tooltip>
							</sl-button-group>
						</div>
						<span class="course-authors">${ t("course.list.authors", { authors: this.toAuthorsString(course.authors) }) }</span>
						<sl-details
							@click=${(e: MouseEvent): void => { e.stopImmediatePropagation() }}
							summary="${ t("course.list.description") }">
								${ unsafeHTML(course.description) }
						</sl-details>
					</div>
				`)}
			</div>
		`;
	}

	private selectCourse(course: Course): void {
		// Use location to navigate to the course page.
		location.assign(`/course/${course.defaultAccessLink}`)
	}

	private toAuthorsString(authors: CourseAuthor[]): string {
		return authors.map(author => author.firstName + " " + author.familyName).join(", ");
	}
}
