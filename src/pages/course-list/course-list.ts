import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";
import { Component } from "../../component/component";
import { I18nLitElement } from "../../component/i18n-mixin";
import { Course } from "../../model/course";
import { courseStore } from "../../store/course.store";
import styles from './course-list.css';

@customElement('course-list')
export class CourseList extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];


	protected override render() {
		return html`
			<div class="course-container">
				${repeat(courseStore.courses, (course) => course.id, (course) => html`
					<course-list-item .course="${course}" @click=${(): void => { this.selectCourse(course) }}></course-list-item>
				`)}
			</div>
		`;
	}

	private selectCourse(course: Course): void {
		// Navigate to the course page.
		Router.go(`/course/${course.defaultAccessLink}`);
	}
}
