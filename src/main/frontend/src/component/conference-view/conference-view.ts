import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { participants } from '../../model/participants';
import { I18nLitElement } from "../i18n-mixin";
import { conferenceViewStyles } from "./conference-view.styles";
import { GridElement } from  '../grid-element/grid-element';

@customElement('conference-view')
export class ConferenceView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		conferenceViewStyles, 
	];
    

    @property()
    gridCounter: number = 0;

    @property()
    gridElementsLimit: number = 20;

    @property()
    columnLimit: number = 5;

    @property({ reflect: true })
    gridColumns: number = 0;

    @property({ reflect: true })
    gridRows: number = 0;

    @query('.grid-container')
    gridContainer: HTMLElement;

    getGridContainer(): HTMLElement {
		return this.renderRoot.querySelector('.grid-container');
	}

    setAlignment(add: boolean) {
        if (this.gridCounter <= this.columnLimit) {
            add ? this.gridColumns += 1 : this.gridColumns -= 1;
        } 
        else {
            if ((this.gridCounter % this.columnLimit) == 0) {
                add ? this.gridRows += 1 : this.gridRows -= 1;
            } 
        }
    }
    

    addGridElement(gridElement: GridElement) {
        this.gridCounter += 1;
        if (this.gridCounter <= this.gridElementsLimit) {
           gridElement.isVisible = true;
        }
        this.gridContainer.appendChild(gridElement);
        this.setAlignment(true);
    }

    override connectedCallback() {
		super.connectedCallback()
		participants.addEventListener("all", () => { this.requestUpdate() }, false);
		participants.addEventListener("added", () => { this.requestUpdate() }, false);
		participants.addEventListener("removed", () => { this.requestUpdate() }, false);
		participants.addEventListener("cleared", () => { this.requestUpdate() }, false);

        document.addEventListener("remove-grid-element", this.removeGridElement.bind(this));
        document.addEventListener("participant-talking", this.onTalkingPublisher.bind(this));
    }

    protected render() {

        return html`
        <style>
        :host .grid-container {
        grid-template-columns: repeat(${this.gridColumns}, 1fr);
        grid-template-rows: repeat(${this.gridRows}, 1fr);
            }
            </style>
            <div class="grid-container">
            </div>
        `;
    }

    private removeGridElement(event: CustomEvent) {
        event.detail.gridElement.remove();
        this.gridCounter -= 1;
        this.setAlignment(false);
    }
    
    private onTalkingPublisher(event: CustomEvent) {		
		const talkingConfig = event.detail;
		const publisherId = talkingConfig.id;
		const state = talkingConfig.state;
        let isTalking = false;
        let counter = 0;

        if (state === "talking") {
            isTalking = true;
        }
        else if (state === "stopped-talking") {
            isTalking = false;
        }

        for (const grid of this.gridContainer.querySelectorAll("grid-element")) {
            counter += 1;
            const gridElement: GridElement = grid as GridElement;
            if (gridElement.publisherId == publisherId) {
                gridElement.isTalking = isTalking;
                // make talking participant visible
                if (isTalking && counter > this.gridElementsLimit) {
                    const lastGridElement: GridElement = this.gridContainer.children[this.gridElementsLimit - 1] as GridElement;
                    lastGridElement.isVisible = false;
                    const secondGridElement: GridElement = this.gridContainer.children[1] as GridElement;
                    gridElement.isVisible = true;
                    this.gridContainer.insertBefore(gridElement, secondGridElement);
                }
            }
        }
    }
}