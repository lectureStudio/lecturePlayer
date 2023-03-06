import { html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { participants } from '../../model/participants';
import { I18nLitElement } from "../i18n-mixin";
import { conferenceViewStyles } from "./conference-view.styles";
import { ParticipantView } from "../participant-view/participant-view";

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

	@property()
	gridCounter: number = 0;

	@property()
	gridElementsLimit: number = 20;

	@property()
	columnLimit: number = 5;

	@property()
	rowsLimit: number = 3;

	@property({ reflect: true })
	gridColumns: number = 0;

	@property({ reflect: true })
	gridRows: number = 0;

	@property({ type: Boolean, reflect: true })
	galleryView: boolean = true;

	@property({ type: Boolean, reflect: true })
	screenRightView: boolean = false;

	@property({ type: Boolean, reflect: true })
	screenTopView: boolean = false;

	@property({ reflect: true })
	screenSharing: boolean = false;

	@query('.grid-container')
	gridContainer: HTMLElement;

	@query('.screen-container')
	screenContainer: HTMLElement;


	getGridContainer(): HTMLElement {
		return this.renderRoot.querySelector('.grid-container');
	}

	setAlignment(add: boolean) {
		if (this.galleryView) {
			if (this.gridCounter <= this.columnLimit) {
				add ? this.gridColumns += 1 : this.gridColumns -= 1;
			}
			else {
				if ((this.gridCounter % this.columnLimit) == 0) {
					add ? this.gridRows += 1 : this.gridRows -= 1;
				}
			}
		}
		else if (this.screenRightView) {
			if (this.gridCounter <= this.rowsLimit) {
				add ? this.gridRows += 1 : this.gridRows -= 1;
			}
			else if (this.gridColumns < this.columnLimit) {
				this.gridColumns += 1;
			}
		}
	}

	addGridElement(view: ParticipantView) {
		this.gridCounter += 1;
		this.gridColumns = Math.min(this.gridCounter, this.columnLimit);
		this.gridRows = Math.ceil(this.gridCounter / this.columnLimit);

		if (this.gridCounter <= this.gridElementsLimit) {
			view.isVisible = true;
		}

		this.gridContainer.appendChild(view);
	}

	addScreenElement(view: ParticipantView) {
		view.isVisible = true;

		this.screenContainer.appendChild(view);
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
				:host participant-view {
					width: ${this.calculateSize().width}px;
					max-height: ${this.calculateSize().height}px;
				}
			</style>
			<sl-resize-observer>
				<div class="screen-container"></div>
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

		console.log(this.gridColumns, this.gridRows, ":", this.contentRect.width, this.contentRect.height, width, height);

		return new DOMRect(0, 0, width, height);
	}

	private removeGridElement(event: CustomEvent) {
		event.detail.gridElement.remove();

		this.gridCounter -= 1;
		this.gridColumns = Math.min(this.gridCounter, this.columnLimit);
		this.gridRows = Math.ceil(this.gridCounter / this.columnLimit);
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

	public setConferenceLayout(layout: string) {
		switch (layout) {
			case "gallery":
				return;
			case "sideRight":
				this.galleryView = false;
				this.screenRightView = true;
				this.columnLimit = 2;
				this.gridCounter > 1 ? this.gridColumns = 2 : this.gridColumns = 1;
				this.gridRows = 3;
			case "screenTop":
				this.galleryView = false;
				this.screenRightView = false;
				this.screenTopView = true;
				this.gridRows = 1;
		}
	}
}