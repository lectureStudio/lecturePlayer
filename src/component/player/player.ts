import { PropertyValues } from "@lit/reactive-element";
import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
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

	readonly controller = new PlayerController(this);


	protected override firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		const router = new Router(this.shadowRoot?.querySelector('#outlet'));
		router.setRoutes([
			{ path: "/", component: "course-list" },
			{ path: "/course/:courseId", component: "course-view" },
			{ path: "(.*)", redirect: "/" },
		]);
	}

	protected override render() {
		return html`
			<div id="outlet"></div>
		`;
	}
}
