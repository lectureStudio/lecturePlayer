import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { course } from '../../model/course';
import { CourseStateDocument } from '../../model/course-state-document';
import { Utils } from '../../utils/utils';
import { I18nLitElement } from '../i18n-mixin';
import { documentNavigationStyles } from './document-navigation.styles';

@customElement('document-navigation')
export class DocumentNavigation extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		documentNavigationStyles,
	];

	@property()
	document: CourseStateDocument;


	override connectedCallback(): void {
		super.connectedCallback();

		course.addEventListener("course-document-state", () => { this.requestUpdate() }, false);
	}

	protected render() {
		const prevEnabled = course.documentState?.currentPage > 0;
		const nextEnabled = course.documentState?.currentPage < course.documentState?.pageCount - 1;

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