import { provide } from "@lit/context";
import { PropertyValues } from "@lit/reactive-element";
import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { courseStore } from "../../store/course.store";
import { CourseApi } from "../../transport/course-api";
import { PlayerController } from './player.controller';
import { I18nLitElement } from '../i18n-mixin';
import { Component } from '../component';
import playerStyles from './player.css';

@customElement('lecture-player')
export class LecturePlayer extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		playerStyles,
	];

	@provide({ context: applicationContext })
	@property({ attribute: false })
	accessor appContext: ApplicationContext = new ApplicationContext();

	readonly controller = new PlayerController(this);


	protected override async firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		await this.loadCourses();
		await this.initRouter();
	}

	protected override render() {
		return html`
			<player-navbar></player-navbar>
			<div id="outlet"></div>
		`;
	}

	private async initRouter() {
		const router = new Router(this.shadowRoot?.querySelector("#outlet"));
		await router.setRoutes([
			{ path: "/", component: "course-list" },
			{ path: "/course/:courseId", component: "course-view" },
			{ path: "(.*)", component: "not-found" },
		]);
	}

	private async loadCourses() {
		await CourseApi.getCourses()
			.then(courses => {
				courseStore.setCourses(courses);
			});
	}
}
