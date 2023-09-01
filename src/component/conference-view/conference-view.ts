import { html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { classMap } from "lit/directives/class-map.js";
import { I18nLitElement } from "../i18n-mixin";
import { ParticipantView } from "../participant-view/participant-view";
import { State } from "../../utils/state";
import { ScreenView } from "../screen-view/screen-view";
import { ContentFocus, ContentLayout } from "../../model/content";
import { privilegeStore } from "../../store/privilege.store";
import { uiStateStore } from "../../store/ui-state.store";
import { autorun } from "mobx";
import conferenceViewStyles from "./conference-view.scss";

@customElement('conference-view')
export class ConferenceView extends I18nLitElement {

	static override styles = [
		I18nLitElement.styles,
		conferenceViewStyles,
	];

	contentRect: DOMRectReadOnly;

	aspectRatio = {
		x: 16 / 9,
		y: 9 / 16
	};

	gridGap: number = 5;

	viewIndex: number = 0;

	/** Specifies how many tiles should be shown at a given time.  */
	@property({ type: Number, attribute: 'tiles-per-page' })
	tilesPerPage = 1;

	@property({ type: Number, attribute: 'tile-height' })
	tileHeight: number;

	@property({ type: Number, attribute: 'tile-width' })
	tileWidth: number;

	@property({ reflect: true })
	layout: ContentLayout;

	@property({ reflect: true })
	contentFocus: ContentFocus;

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

	@property({ type: Boolean, reflect: true })
	isSpeaker: boolean = false;

	@query('.grid-container')
	gridContainer: HTMLElement;

	@query('.presentation-container')
	presentationContainer: HTMLElement;

	@query("screen-view")
	screenView: ScreenView;


	public addGridElement(view: ParticipantView) {
		this.gridCounter += 1;

		if (this.gridCounter <= this.gridElementsLimit) {
			view.isVisible = true;
		}

		this.gridContainer.appendChild(view);

		this.updateGridState();
		this.calculateSize();
	}

	override connectedCallback() {
		super.connectedCallback();

		document.addEventListener("remove-grid-element", this.removeGridElement.bind(this));
		document.addEventListener("participant-talking", this.onTalkingPublisher.bind(this));
		document.addEventListener("speaker-view", this.onSpeakerView.bind(this));
		document.addEventListener("settings-layout", this.onLayoutChange.bind(this));

		// Mandatory to set the layout first, since setContentFocus() may modify the layout.
		autorun(() => {
			this.setContentLayout(uiStateStore.contentLayout);
		});
		autorun(() => {
			this.setContentFocus(uiStateStore.contentFocus);
		});
	}

	protected override firstUpdated() {
		const resizeObserver = this.renderRoot.querySelector("sl-resize-observer");

		if (resizeObserver) {
			resizeObserver.addEventListener("sl-resize", event => {
				const entries = event.detail.entries;

				if (entries.length > 0) {
					this.contentRect = entries[0].contentRect;

					this.calculateSize();
				}
			});
		}
	}

	protected override render() {
		const prevEnabled = this.viewIndex > 0;
		const nextEnabled = this.viewIndex + this.tilesPerPage < this.gridCounter;

		return html`
			<div class="presentation-container">
				<screen-view></screen-view>

				<div class="document-container">
					<slide-view class="conference-slides"></slide-view>

					${when(privilegeStore.canShareDocuments(), () => html`
					<document-navigation></document-navigation>
					`)}
				</div>
			</div>

			<sl-resize-observer>
				<div class="tiles">
					<sl-icon-button
						@click="${this.onScroll}"
						?disabled="${!prevEnabled}"
						name="${this.getIconName(true)}"
						data-step="-1"
						class="${classMap({
							'conference-navigation-button': true,
							'conference-navigation-button--visible': prevEnabled
						})}"
						id="top-left-button"
					>
					</sl-icon-button>
					<div class="grid-parent" style="--tiles-per-page: ${this.tilesPerPage}; --tile-width: ${this.tileWidth}; --tile-height: ${this.tileHeight};">
						<div class="grid-container"></div>
					</div>
					<sl-icon-button
						@click="${this.onScroll}"
						?disabled="${!nextEnabled}"
						name="${this.getIconName(false)}"
						data-step="1"
						class="${classMap({
							'conference-navigation-button': true,
							'conference-navigation-button--visible': nextEnabled
						})}"
						id="bottom-right-button"
					>
					</sl-icon-button>
				</div>
			</sl-resize-observer>
		`;
	}

	public setContentLayout(layout: ContentLayout) {
		this.layout = layout;

		this.updateGridState();
	}

	private setContentFocus(focus: ContentFocus) {
		this.contentFocus = focus;

		switch (this.contentFocus) {
			case ContentFocus.Document:
			case ContentFocus.ScreenShare:
				this.setContentLayout(ContentLayout.PresentationBottom);
				break;
			default:
				this.setContentLayout(ContentLayout.Gallery);
				break;
		}
	}

	private getIconName(topLeft: boolean) {
		switch (this.layout) {
			case ContentLayout.PresentationBottom:
			case ContentLayout.PresentationTop:
				return topLeft ? "chevron-left" : "chevron-right";

			case ContentLayout.PresentationLeft:
			case ContentLayout.PresentationRight:
				return topLeft ? "chevron-up" : "chevron-down";

			default:
				return "";
		}
	}

	private onScroll(event: Event) {
		const step = parseInt((event.target as HTMLElement).dataset.step ?? "0");

		// Check scroll index constraints.
		if (this.viewIndex + step < 0 || this.viewIndex + this.tilesPerPage + step > this.gridCounter) {
			return;
		}

		this.viewIndex += step;

		const views = this.gridContainer.getElementsByTagName("participant-view");
		const view = views[this.viewIndex] as HTMLElement;

		this.gridContainer.scrollTo({
			left: view.offsetLeft,
			top: view.offsetTop,
			behavior: "smooth"
		});

		this.requestUpdate();
	}

	private calculateSize() {
		if (!this.contentRect) {
			return;
		}

		// Calculate tile size based on available height.
		let contentHeight = this.contentRect.height;
		let contentWidth = this.contentRect.width;

		switch (this.layout) {
			case ContentLayout.PresentationBottom:
			case ContentLayout.PresentationTop:
				contentWidth -= 80; // Size of navigation buttons.
				break;

			case ContentLayout.PresentationLeft:
			case ContentLayout.PresentationRight:
				contentHeight -= 80; // Size of navigation buttons.
				break;
		}

		let height = contentHeight / this.gridRows - (this.gridRows - 1) * this.gridGap;
		let width = height * this.aspectRatio.x;

		if (width * this.gridColumns > this.contentRect.width) {
			// Calculate in reverse direction based on available width.
			width = this.contentRect.width / this.gridColumns - (this.gridColumns - 1) * this.gridGap;
			height = width * this.aspectRatio.y;
		}

		this.tileWidth = width;
		this.tileHeight = height;

		switch (this.layout) {
			case ContentLayout.PresentationBottom:
			case ContentLayout.PresentationTop:
				this.tilesPerPage = Math.min(this.gridCounter, Math.floor(contentWidth / width));
				break;

			case ContentLayout.PresentationLeft:
			case ContentLayout.PresentationRight:
				this.tilesPerPage = Math.min(this.gridCounter, Math.floor(contentHeight / height));
				break;
		}

		if (this.tilesPerPage === this.gridCounter) {
			// All views are visible.
			this.viewIndex = 0;
		}

		this.requestUpdate();
	}

	private updateGridState() {
		if (this.layout === ContentLayout.Gallery) {
			this.gridColumns = Math.min(this.gridCounter, this.columnLimit);
			this.gridRows = Math.ceil(this.gridCounter / this.columnLimit);
		}
		else {
			this.gridColumns = 1;
			this.gridRows = 1;
		}
	}

	private removeGridElement(event: CustomEvent) {

		const speaker = this.presentationContainer.querySelector("participant-view") as ParticipantView;
		const toRemove = event.detail.gridElement as ParticipantView;

		if (speaker === toRemove) {
			speaker.remove();
			const newSpeaker = this.gridContainer.children[0] as ParticipantView;
			this.presentationContainer.appendChild(newSpeaker);

			const lastVisible = this.gridContainer.children[this.gridElementsLimit] as ParticipantView;
			if (lastVisible) {
				lastVisible.isVisible = true;
			}
		}
		else event.detail.gridElement.remove();

		this.gridCounter -= 1;

		this.updateGridState();
		this.calculateSize();
	}

	private onParticipantScreenStream(event: CustomEvent) {
		const state: State = event.detail.state;

		if (this.isSpeaker) {
			this.resetGalleryView();
		}
		else {
			this.isSpeaker = false;
		}

		if (state === State.CONNECTED) {
			uiStateStore.setContentFocus(ContentFocus.ScreenShare);
		}
		else if (state === State.DISCONNECTED) {
			if (uiStateStore.contentFocus === ContentFocus.ScreenShare) {
				// Change focus only if screen-share is active.
				uiStateStore.setContentFocus(uiStateStore.previousContentFocus);
			}
		}
	}

	private onParticipantScreenVisibility(event: CustomEvent) {
		const visible: boolean = event.detail.visible;

		uiStateStore.setContentFocus(visible ? ContentFocus.ScreenShare : uiStateStore.previousContentFocus);
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

		const speaker = this.presentationContainer.querySelector("participant-view") as ParticipantView;

		if (this.isSpeaker && speaker?.publisherId == publisherId) {
			speaker.isTalking = isTalking;
		}
		else {
			for (const grid of this.gridContainer.querySelectorAll("participant-view")) {
				counter += 1;
				const gridElement = grid as ParticipantView;

				if (gridElement.publisherId == publisherId) {
					gridElement.isTalking = isTalking;
					// highlight current speaker
					if (this.isSpeaker && isTalking) {
						const firstGridElement = this.gridContainer.children[0] as ParticipantView;
						this.gridContainer.insertBefore(speaker, firstGridElement);
						gridElement.isVisible = true;
						this.presentationContainer.appendChild(gridElement);
						
						if (counter > this.gridElementsLimit) {
							const lastGridElement = this.gridContainer.children[this.gridElementsLimit - 1] as ParticipantView;
							lastGridElement.isVisible = false;
						}
					}
					else {
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
	}

	private onSpeakerView(event: CustomEvent) {
		this.isSpeaker = event.detail;
		const firstSpeaker = this.gridContainer.children[0] as ParticipantView;

		if (firstSpeaker && this.isSpeaker) {
			this.presentationContainer.appendChild(firstSpeaker);
			this.setContentLayout(ContentLayout.PresentationLeft);
		}
		else if (!this.isSpeaker) {
			this.resetGalleryView();
		}
	}

	private resetGalleryView(): void {
		const speaker = this.presentationContainer.querySelector("participant-view");
		const firstGrid = this.gridContainer.children[0] as ParticipantView;

		if (speaker) {
			const lastGridElement = this.gridContainer.children[this.gridElementsLimit - 1] as ParticipantView;
			if (this.gridCounter >= this.gridElementsLimit) {
				lastGridElement.isVisible = false;
			}
			if (firstGrid) {
				this.gridContainer.insertBefore(speaker, firstGrid);
			}
			else {
				this.gridContainer.appendChild(speaker);
			}
		}

		this.setContentLayout(ContentLayout.Gallery);
	}

	private onLayoutChange(e: CustomEvent): void {
		const layout = e.detail;
		this.setContentLayout(ContentLayout[layout as keyof typeof ContentLayout]);
	}
}