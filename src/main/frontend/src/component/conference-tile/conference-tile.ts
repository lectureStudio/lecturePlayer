import { html} from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ParticipantView } from '../participant-view/participant-view';
import { I18nLitElement } from "../i18n-mixin";
import { conferenceTileStyles } from "./conference-tile.styles";

@customElement('conference-tile')
export class ConferenceTile extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
        conferenceTileStyles 
	];

    @property({reflect: true })
	tileId: number;

    @property()
    view: ParticipantView;

    @property({ type: Boolean, reflect: true })
    talking: boolean = false;

    addView(view: ParticipantView) {
        this.view = view;
    }

    setTileId(tileId: number) {
        this.tileId = tileId;
    }

    render() {
		return html`
            <div class="inner-container talking">
                <div class="col">
                    ${this.view}
                </div>
            </div>
        `
    }

}
