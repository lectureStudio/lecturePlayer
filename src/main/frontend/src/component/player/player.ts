import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { playerStyles } from './player.styles';
import { PlayerController } from './player.controller';
import { I18nLitElement } from '../i18n-mixin';
import { State } from '../../utils/state';

@customElement('lecture-player')
export class LecturePlayer extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		playerStyles,
	];

	private controller = new PlayerController(this);

	@property({ reflect: true })
	state: State = State.CONNECTING;

	@property({ type: Number })
	courseId: number;


	render() {
		return html`
			<player-loading></player-loading>
			<player-view .courseId="${this.courseId}"></player-view>
			<player-offline></player-offline>
		`;
	}
}
