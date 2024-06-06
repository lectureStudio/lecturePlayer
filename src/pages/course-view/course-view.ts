import { PropertyValues } from "@lit/reactive-element";
import { Router, BeforeEnterObserver, PreventAndRedirectCommands, RouterLocation } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from "lit/directives/repeat.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { when } from "lit/directives/when.js";
import { Component } from "../../component/component";
import { I18nLitElement } from "../../component/i18n-mixin";
import { t } from "i18next";
import { Course, CourseAuthor } from "../../model/course";
import { courseStore } from "../../store/course.store";
import style from './course-view.css';

@customElement('course-view')
export class CourseView extends Component implements BeforeEnterObserver {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		style,
	];

	@property({ type: Number })
	accessor courseId: number;


	public onBeforeEnter(location: RouterLocation, commands: PreventAndRedirectCommands, router: Router) {
		console.log(location)
	}

	protected override firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		// this.courseId = this.location.params?.courseId;
	}

	protected override render() {
		return html`
			
		`;
	}
}
