import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import playerLoadingStyles from './player-loading.scss';

@customElement('player-loading')
export class PlayerLoading extends I18nLitElement {

	static override styles = [
		playerLoadingStyles,
	];

	@property()
	text: string;


	override render() {
		return html`
			<div class="lds-ellipsis">
				<div></div><div></div><div></div><div></div>
			</div>
			<span>${this.text}</span>
		`;
	}
}