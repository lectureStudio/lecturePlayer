import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { participants } from '../../model/participants';
import { ParticipantView } from '../participant-view/participant-view';;
import { I18nLitElement } from "../i18n-mixin";
import { conferenceViewStyles } from "./conference-view.styles";
import { ConferenceTile } from  '../conference-tile/conference-tile';
import { course } from "../../model/course";
import { CourseParticipantPresence } from "../../model/course-state";
import { EventService } from "../../service/event.service";

@customElement('conference-view')
export class ConferenceView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		conferenceViewStyles, 
	];
    

    @property()
    tilesCounter = 0;

    @property()
    columnLimit: number = 5;

    @property()
    hiddenTiles: ConferenceTile[];

    @property({ reflect: true })
    conferenceColumns: number = 0;

    @property({ reflect: true })
    conferenceRows: number = 0;

    @property({ type: Boolean, reflect: true })
	camMute: boolean = false;

    @query('.tiles-container')
    tilesContainer: HTMLElement;

    getTilesContainer(): HTMLElement {
		return this.renderRoot.querySelector('.tiles-container');
	}

    setAlignment(add: boolean) {
        if (this.tilesCounter <= this.columnLimit) {
            add ? this.conferenceColumns += 1 : this.conferenceColumns -= 1;
        } 
        else {
            if ((this.tilesCounter % this.columnLimit) == 0) {
                add ? this.conferenceRows += 1 : this.conferenceRows -= 1;
            } 
        }
    }

    addParticipantView(view: ParticipantView, tileId:number) {
        const tile: ConferenceTile = new ConferenceTile();
        tile.addView(view);
        tile.setTileId(tileId);
        tile.classList.add("talking");
        if (this.tilesCounter >= 20) {
            tile.classList.add("hide-tile");
        }
        this.tilesContainer.appendChild(tile);
        this.tilesCounter += 1;
        this.setAlignment(true);
    }

    override connectedCallback() {
		super.connectedCallback()
		participants.addEventListener("all", () => { this.requestUpdate() }, false);
		participants.addEventListener("added", () => { this.requestUpdate() }, false);
		participants.addEventListener("removed", () => { this.requestUpdate() }, false);
		participants.addEventListener("cleared", () => { this.requestUpdate() }, false);

        //document.addEventListener("participant-disconnected", this.onParticipantDisconnect.bind(this));

        document.addEventListener("leaving-room", this.removeParticipantView.bind(this));
        document.addEventListener("participant-talking", this.onParticipantTalking.bind(this));
        document.addEventListener("subscriber-cam-mute", this.onCamMute.bind(this));

    }

    protected render() {

        return html`
        <style>
        :host .tiles-container {
        grid-template-columns: repeat(${this.conferenceColumns}, 1fr);
        grid-template-rows: repeat(${this.conferenceRows}, 1fr);
            }
            </style>
            <div class="tiles-container">
            </div>
        `;
    }
    
    private removeParticipantView(event: CustomEvent) {
        const tileId = event.detail;
        const tile = this.renderRoot?.querySelector(`conference-tile[tileid='${tileId}']`)
        tile.remove();
        this.tilesCounter -= 1;
        this.setAlignment(false);
        if (this.tilesCounter >= 20) {
            const container = this.renderRoot.querySelector('.tiles-container');
            const lastTile = container.children[19]
            lastTile.classList.remove("hide-tile");
        }
    }

    private onParticipantTalking(event: CustomEvent) {
        const tileId = event.detail.id;
        const state = event.detail.state;
        const tile: ConferenceTile = this.renderRoot?.querySelector(`conference-tile[tileid='${tileId}']`);
        if(state == "talking") {
            if (tile.classList.contains("hide-tile")) {
                const container = this.renderRoot.querySelector('.tiles-container');
                const lastTile = container.children[19];
                const secondTile = container.children[1];
                container.insertBefore(tile, secondTile);
                lastTile.classList.add("hide-tile");
                tile.classList.remove("hide-tile");
            }  

            tile.talking = true;
        } else tile.talking = false;
    }

    private onCamMute(event: CustomEvent) {
        console.log("camMute", event)
        const tileId = event.detail.id;
        const mutedCam = event.detail.muted;
        const tile: ConferenceTile = this.renderRoot?.querySelector(`conference-tile[tileid='${tileId}']`);
        mutedCam ? tile?.view.video.classList.add("hide-video") : tile?.view.video.classList.remove("hide-video");
    }

    private onParticipantDisconnect(event: CustomEvent) {
        console.log("evenOnP", event)
		const tileId = event.detail.firstName + " " + event.detail.familyName;
        const tile = this.renderRoot?.querySelector(`conference-tile[tileid='${tileId}']`)
        tile.remove();
        this.tilesCounter -= 1;
        this.setAlignment(false);
	}
}