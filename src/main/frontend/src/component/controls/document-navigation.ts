import { html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { Utils } from '../../utils/utils';
import { I18nLitElement, t } from '../i18n-mixin';
import { documentNavigationStyles } from './document-navigation.styles';

@customElement('document-navigation')
export class DocumentNavigation extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentNavigationStyles,
	];


	protected render() {
		const prevEnabled = true;
		const nextEnabled = true;

		return html`
			<sl-icon-button @click="${this.onPreviousSlide}" ?disabled="${!prevEnabled}" name="arrow-left-short" class="document-navigation-button"></sl-icon-button>
			<sl-icon-button @click="${this.onNextSlide}" ?disabled="${!nextEnabled}" name="arrow-right-short" class="document-navigation-button"></sl-icon-button>
		`;
	}

	private onPreviousSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-prev-page"));
	}

	private onNextSlide() {
		this.dispatchEvent(Utils.createEvent("lect-document-next-page"));
	}
}