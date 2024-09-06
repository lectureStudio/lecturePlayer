import { provide } from "@lit/context";
import { PropertyValues } from "@lit/reactive-element";
import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { applicationContext, ApplicationContext } from "../../context/application.context";
import { PlayerController } from './player.controller';
import { I18nLitElement } from '../i18n-mixin';
import { Component } from '../component';
import styles from './player.css';

@customElement('lecture-player')
export class LecturePlayer extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		styles,
	];

	@provide({ context: applicationContext })
	@property({ attribute: false })
	accessor appContext: ApplicationContext = new ApplicationContext();

	readonly controller = new PlayerController(this);


	protected override async firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		await this.controller.load();
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
			{ path: "/course/edit/:courseId", component: "course-form" },
			{ path: "/settings", component: "app-settings" },
			{ path: "(.*)", component: "not-found" },
		]);
	}
}
