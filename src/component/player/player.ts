import { PropertyValues } from "@lit/reactive-element";
import { Router } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { PlayerController } from './player.controller';
import { I18nLitElement, t } from '../i18n-mixin';
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
			{ path: "/course/:courseId", component: "player-view" },
			{ path: "(.*)", redirect: "/" },
		]);
	}

	protected override render() {
		return html`
			<div id="outlet"></div>
		`;

		// switch (uiStateStore.state) {
		// 	case State.CONNECTING:
		// 		return html`<player-loading .text="${t("course.loading")}"></player-loading>`;
		// 	case State.CONNECTED:
		// 	case State.RECONNECTING:
		// 		return html`<player-view .eventEmitter="${this.controller.eventEmitter}" .playerController="${this.controller}" .chatService="${this.controller.chatService}" .moderationService="${this.controller.moderationService}"></player-view>`;
		// 	case State.CONNECTED_FEATURES:
		// 		return html`<player-feature-view .chatService="${this.controller.chatService}" .moderationService="${this.controller.moderationService}"></player-feature-view>`;
		// 	case State.DISCONNECTED:
		// 		return html`<player-offline></player-offline>`;
		// 	case State.NO_ACCESS:
		// 		return html`<player-no-access></player-no-access>`;
		// }
	}
}
