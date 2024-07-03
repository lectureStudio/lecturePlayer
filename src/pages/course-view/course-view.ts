import { consume, provide } from "@lit/context";
import { PropertyValues } from "@lit/reactive-element";
import { BeforeEnterObserver, RouterLocation } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { ApplicationContext, applicationContext } from "../../context/application.context";
import { CourseContext, courseContext } from "../../context/course.context";
import { Course } from "../../model/course";
import { courseStore } from "../../store/course.store";
import { uiStateStore } from "../../store/ui-state.store";
import { State } from "../../utils/state";
import { CourseViewController } from "./course-view.controller";
import styles from './course-view.css';

@customElement('course-view')
export class CourseView extends Component implements BeforeEnterObserver {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	controller: CourseViewController;

	@provide({ context: courseContext })
	@property({ attribute: false })
	accessor courseContext: CourseContext;

	@consume({ context: applicationContext })
	accessor applicationContext: ApplicationContext;

	course: Course | undefined;


	public onBeforeEnter(location: RouterLocation) {
		// This is the course access link.
		const courseAlias: string = location.params.courseId.toString();

		// Find course with the access link.
		this.course = courseStore.findCourseByAccessLink(courseAlias);

		if (!this.course) {
			throw new Error("Course not found");
		}

		courseStore.setActiveCourse(this.course);
	}

	override disconnectedCallback() {
		super.disconnectedCallback();

		courseStore.setActiveCourse(null);
	}

	protected override firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		if (!this.course) {
			throw new Error("Course not found");
		}

		this.courseContext = new CourseContext(this.applicationContext, this.course);
		this.controller = new CourseViewController(this);
	}

	protected override render() {
		switch (uiStateStore.state) {
			case State.CONNECTING:
				return html`<loading-indicator .text="${t("course.loading")}"></loading-indicator>`;
			case State.CONNECTED:
			case State.RECONNECTING:
				return html`<course-stream-view></course-stream-view>`;
			case State.CONNECTED_FEATURES:
				return html`<course-feature-view></course-feature-view>`;
			case State.DISCONNECTED:
				return html`<course-offline></course-offline>`;
			case State.NO_ACCESS:
				return html`<course-no-access></course-no-access>`;
		}
	}
}
