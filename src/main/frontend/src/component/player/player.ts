import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { playerStyles } from './player.styles';
import { PlayerController } from './player.controller';
import { I18nLitElement } from '../i18n-mixin';
import { State } from '../../utils/state';

@customElement('lecture-player')
export class LecturePlayer extends I18nLitElement {

	private controller = new PlayerController(this);

	static styles = [
		playerStyles,
	];

	@property()
	courseId: number = 2;


	render() {
		switch (this.controller.state) {
			case State.CONNECTING:
				return html`<player-loading></player-loading>`;
			case State.CONNECTED:
				return html`<player-view></player-view>`;
			case State.DISCONNECTED:
				return html`<player-offline></player-offline>`;
		}
	}
}
