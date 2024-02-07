import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PlayerController } from './player.controller';
import { I18nLitElement, t } from '../i18n-mixin';
import { State } from '../../utils/state';
import { uiStateStore } from '../../store/ui-state.store';
import { Component } from '../component';
import playerStyles from './player.css';

@customElement('lecture-player')
export class LecturePlayer extends Component {

	static override styles = <CSSResultGroup>[
		I18nLitElement.styles,
		playerStyles,
	];

	readonly controller = new PlayerController(this);

	@property({ type: Number })
	courseId: number;


	protected override render() {
		switch (uiStateStore.state) {
			case State.CONNECTING:
				return html`<player-loading .text="${t("course.loading")}"></player-loading>`;
			case State.CONNECTED:
			case State.RECONNECTING:
				return html`<player-view .eventEmitter="${this.controller.eventEmitter}" .playerController="${this.controller}" .chatService="${this.controller.chatService}"></player-view>`;
			case State.CONNECTED_FEATURES:
				return html`<player-feature-view .chatService="${this.controller.chatService}"></player-feature-view>`;
			case State.DISCONNECTED:
				return html`<player-offline></player-offline>`;
			case State.NO_ACCESS:
				return html`<player-no-access></player-no-access>`;
		}
	}
}
