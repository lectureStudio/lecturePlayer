import { CSSResultGroup, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { choose } from 'lit/directives/choose.js';
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
		return html`
			${choose(uiStateStore.state, [
				[State.CONNECTING,			() => html`<player-loading .text="${t("course.loading")}"></player-loading>`],
				[State.CONNECTED,			() => html`<player-view .eventEmitter="${this.controller.eventEmitter}" .playerController="${this.controller}" .chatService="${this.controller.chatService}"></player-view>`],
				[State.CONNECTED_FEATURES,	() => html`<player-feature-view .chatService="${this.controller.chatService}"></player-feature-view>`],
				[State.DISCONNECTED,		() => html`<player-offline></player-offline>`]
			],
			() => html`<h1>Something went wrong</h1>`)}
		`;
	}
}
