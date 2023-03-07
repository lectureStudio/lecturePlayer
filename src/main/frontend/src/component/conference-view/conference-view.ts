import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { participants } from '../../model/participants';
import { I18nLitElement } from "../i18n-mixin";
import { conferenceViewStyles } from "./conference-view.styles";
import { ParticipantView } from "../participant-view/participant-view";
import { State } from "../../utils/state";
import { ScreenView } from "../screen-view/screen-view";

export enum ConferenceLayout {

	Gallery,
	PresentationTop,
	PresentationRight,
	PresentationBottom,
	PresentationLeft

}

@customElement('conference-view')
export class ConferenceView extends I18nLitElement {

	static styles = [
		I18nLitElement.styles,
		conferenceViewStyles,
	];

	contentRect: DOMRectReadOnly;

	aspectRatio = {
		x: 16 / 9,
		y: 9 / 16
	};

	gridGap: number = 5;

	@property({ reflect: true })
	layout: ConferenceLayout = ConferenceLayout.Gallery;

	@state()
	gridCounter: number = 0;

	@state()
	gridColumns: number = 0;

	@state()
	gridRows: number = 0;

	@property()
	gridElementsLimit: number = 20;

	@property()
	columnLimit: number = 5;

	@property()
	rowsLimit: number = 3;

	@property({ reflect: true })
	screenSharing: boolean = false;

	@query('.grid-container')
	gridContainer: HTMLElement;

	@query('.screen-container')
	screenContainer: HTMLElement;

	@query("screen-view")
	screenView: ScreenView;


	public addGridElement(view: ParticipantView) {
		this.gridCounter += 1;

		this.updateGridState();

		if (this.gridCounter <= this.gridElementsLimit) {
			view.isVisible = true;
		}

		view.addEventListener("participant-screen-stream", this.onParticipantScreenStream.bind(this));
		view.addEventListener("participant-screen-visibility", this.onParticipantScreenVisibility.bind(this));

		this.gridContainer.appendChild(view);
	}

	public addScreenElement(view: ParticipantView) {
		view.isVisible = true;

		this.screenContainer.appendChild(view);
	}

	public setConferenceLayout(layout: ConferenceLayout) {
		this.layout = layout;

		this.updateGridState();
	}

	override connectedCallback() {
		super.connectedCallback();

		participants.addEventListener("all", () => { this.requestUpdate() }, false);
		participants.addEventListener("added", () => { this.requestUpdate() }, false);
		participants.addEventListener("removed", () => { this.requestUpdate() }, false);
		participants.addEventListener("cleared", () => { this.requestUpdate() }, false);

		document.addEventListener("remove-grid-element", this.removeGridElement.bind(this));
		document.addEventListener("participant-talking", this.onTalkingPublisher.bind(this));
	}

	protected firstUpdated() {
		const resizeObserver = this.renderRoot.querySelector("sl-resize-observer");

		resizeObserver.addEventListener("sl-resize", event => {
			const entries = event.detail.entries;

			if (entries.length > 0) {
				this.contentRect = entries[0].contentRect;

				this.requestUpdate();
			}
		});
	}

	protected render() {
		return html`
			<style>
				:host .grid-container participant-view {
					width: ${this.calculateSize().width}px;
					max-height: ${this.calculateSize().height}px;
				}
			</style>
			<div class="screen-container">
				<screen-view></screen-view>
			</div>
			<sl-resize-observer>
				<div class="grid-container"></div>
			</sl-resize-observer>
		`;
	}

	private calculateSize() {
		if (!this.contentRect) {
			return new DOMRect(0, 0, 0, 0);
		}

		// Calculate based on available height.
		let height = this.contentRect.height / this.gridRows - (this.gridRows - 1) * this.gridGap;
		let width = height * this.aspectRatio.x;
		const totalWidth = width * this.gridColumns;

		if (totalWidth > this.contentRect.width) {
			// Calculate in reverse direction based on available width.
			width = this.contentRect.width / this.gridColumns - (this.gridColumns - 1) * this.gridGap;
			height = width * this.aspectRatio.y;
		}

		// console.log(this.gridColumns, this.gridRows, ":", this.contentRect.width, this.contentRect.height, width, height);

		return new DOMRect(0, 0, width, height);
	}

	private updateGridState() {
		if (this.layout === ConferenceLayout.Gallery) {
			this.gridColumns = Math.min(this.gridCounter, this.columnLimit);
			this.gridRows = Math.ceil(this.gridCounter / this.columnLimit);
		}
		else {
			this.gridColumns = 1;
			this.gridRows = 1;
		}
	}

	private removeGridElement(event: CustomEvent) {
		event.detail.gridElement.remove();

		this.gridCounter -= 1;

		this.updateGridState();
	}

	private onParticipantScreenStream(event: CustomEvent) {
		const state: State = event.detail.state;

		if (state === State.CONNECTED) {
			this.screenView.setState(State.CONNECTED);
			this.screenView.addVideo(event.detail.video);

			this.setConferenceLayout(ConferenceLayout.PresentationBottom);
		}
		else if (state === State.DISCONNECTED) {
			this.screenView.setState(State.DISCONNECTED);
			this.screenView.removeVideo();

			this.setConferenceLayout(ConferenceLayout.Gallery);
		}
	}

	private onParticipantScreenVisibility(event: CustomEvent) {
		const visible: boolean = event.detail.visible;

		this.screenView.setVideoVisible(visible);

		this.setConferenceLayout(ConferenceLayout.Gallery);
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

		for (const grid of this.gridContainer.querySelectorAll("participant-view")) {
			counter += 1;
			const gridElement = grid as ParticipantView;
			if (gridElement.publisherId == publisherId) {
				gridElement.isTalking = isTalking;
				// make talking participant visible
				if (isTalking && counter > this.gridElementsLimit) {
					const lastGridElement = this.gridContainer.children[this.gridElementsLimit - 1] as ParticipantView;
					lastGridElement.isVisible = false;
					const secondGridElement = this.gridContainer.children[1] as ParticipantView;
					gridElement.isVisible = true;
					this.gridContainer.insertBefore(gridElement, secondGridElement);
				}
			}
		}
	}
}