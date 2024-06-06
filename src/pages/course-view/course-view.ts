import { PropertyValues } from "@lit/reactive-element";
import { BeforeEnterObserver, RouterLocation } from "@vaadin/router";
import { CSSResultGroup, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Component } from "../../component/component";
import { I18nLitElement, t } from "../../component/i18n-mixin";
import { uiStateStore } from "../../store/ui-state.store";
import { State } from "../../utils/state";
import style from './course-view.css';

@customElement('course-view')
export class CourseView extends Component implements BeforeEnterObserver {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		style,
	];

	courseId: number;


	public onBeforeEnter(location: RouterLocation) {
		const courseId: string = location.params.courseId.toString();

	}

	protected override firstUpdated(_changedProperties: PropertyValues) {
		super.firstUpdated(_changedProperties);

		// this.courseId = this.location.params?.courseId;
	}

	protected override render() {
		switch (uiStateStore.state) {
			case State.CONNECTING:
				return html`<player-loading .text="${t("course.loading")}"></player-loading>`;
			case State.CONNECTED:
			case State.RECONNECTING:
				return html`<player-view .eventEmitter="${this.controller.eventEmitter}" .playerController="${this.controller}" .chatService="${this.controller.chatService}" .moderationService="${this.controller.moderationService}"></player-view>`;
			case State.CONNECTED_FEATURES:
				return html`<player-feature-view .chatService="${this.controller.chatService}" .moderationService="${this.controller.moderationService}"></player-feature-view>`;
			case State.DISCONNECTED:
				return html`<player-offline></player-offline>`;
			case State.NO_ACCESS:
				return html`<player-no-access></player-no-access>`;
		}
	}
}
