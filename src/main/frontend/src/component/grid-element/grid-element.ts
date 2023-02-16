import { html} from "lit";
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

    addView(view: ParticipantView) {
        this.view = view;
    }

    render() {
		return html`
            <div class="inner-container">
                <div class="col">
                    ${this.view}
                </div>
            </div>
        `
    }

}
