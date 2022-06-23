import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement, t } from '../i18n-mixin';
import { playerLoadingStyles } from './player-loading.styles';

@customElement('player-loading')
export class PlayerLoading extends I18nLitElement {

	static styles = [
		playerLoadingStyles,
	];

	@property()
	text: string;


	render() {
		return html`
			<div class="lds-ellipsis">
				<div></div><div></div><div></div><div></div>
			</div>
			<span>${this.text}</span>
		`;
	}
}