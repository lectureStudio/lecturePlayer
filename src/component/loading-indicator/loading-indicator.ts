import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { I18nLitElement } from '../i18n-mixin';
import styles from './loading-indicator.css';

@customElement('loading-indicator')
export class LoadingIndicator extends I18nLitElement {

	static override styles = [
		styles,
	];

	@property()
	accessor text: string;


	override render() {
		return html`
			<div part="indicator" class="lds-ellipsis">
				<div></div><div></div><div></div><div></div>
			</div>
			<span part="label">${this.text}</span>
		`;
	}
}
