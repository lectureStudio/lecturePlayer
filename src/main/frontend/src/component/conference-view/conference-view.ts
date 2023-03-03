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
    gridCounter = 0;

    @property()
    gridElementsLimit = 20;

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
        if (this.gridCounter < 20) {
            gridElement.isVisible = true;
        }
        this.gridContainer.appendChild(gridElement);
        this.gridCounter += 1;
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
		// TODO: fix talking idicator
		
		const talkingConfig = event.detail;
        const gridElement = talkingConfig.gridElement;
		const publisherId = talkingConfig.id;
		const state = talkingConfig.state;
        let isTalking = false;

        if (talkingConfig.state === "talking") {
            isTalking = true;
        }
        else if (talkingConfig.state === "stopped-talking") {
            isTalking = false;
        }

        for (const grid of this.gridContainer.querySelectorAll("grid-element")) {
            const gridElement: GridElement = grid as GridElement;
            console.log(gridElement)
            if (gridElement.publisherId == publisherId) {
                console.log("gridPub", gridElement.publisherId, publisherId)
                gridElement.isTalking = isTalking;
            }
        }

        if (!gridElement.isVisible) {
            if (this.gridCounter >= this.gridElementsLimit) {
                this.gridContainer.children[this.gridElementsLimit - 1].remove();

                const secondGridElement = this.gridContainer.children[1];
                this.gridContainer.insertBefore(gridElement, secondGridElement);
                gridElement.isVisible = true;
            }

			
        }
    }

    private setTalkingGrid(isTalking:boolean, id: number) {
        for (const grid of this.gridContainer.querySelectorAll("grid-element")) {
            const gridElement:GridElement = grid as GridElement;
            console.log(gridElement)
        }
    }
}