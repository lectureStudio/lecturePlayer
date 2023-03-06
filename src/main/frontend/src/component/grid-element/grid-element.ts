import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ParticipantView } from '../participant-view/participant-view';
import { I18nLitElement } from "../i18n-mixin";
import { gridElementStyles } from "./grid-element.styles";

@customElement('grid-element')
export class GridElement extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		gridElementStyles
	];

	@property()
	view: ParticipantView;

	@property({ type: Boolean, reflect: true })
	isVisible: boolean = false;

	@property({ type: Boolean, reflect: true })
	isTalking: boolean = false;

	publisherId: bigint;


	addView(view: ParticipantView) {
		this.view = view;
	}

	render() {
		return html`
			${this.view}
        `
	}

}
