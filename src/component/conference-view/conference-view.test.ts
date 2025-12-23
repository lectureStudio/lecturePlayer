import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { ConferenceView } from "./conference-view.js";
import "./conference-view.js";

import { ContentLayout, ContentFocus } from "../../model/content.js";
import { uiStateStore } from "../../store/ui-state.store.js";

describe("ConferenceView", () => {
	let element: ConferenceView;

	beforeEach(async () => {
		// Reset store state
		uiStateStore.setContentLayout(ContentLayout.Gallery);
		uiStateStore.setContentFocus(ContentFocus.None);
		element = await fixture(html`<conference-view></conference-view>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("conference-view");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("structure", () => {
		it("renders presentation container", async () => {
			await elementUpdated(element);
			const presentationContainer = element.shadowRoot!.querySelector(".presentation-container");
			expect(presentationContainer).to.exist;
		});

		it("renders screen view", async () => {
			await elementUpdated(element);
			const screenView = element.shadowRoot!.querySelector("screen-view");
			expect(screenView).to.exist;
		});

		it("renders document container", async () => {
			await elementUpdated(element);
			const documentContainer = element.shadowRoot!.querySelector(".document-container");
			expect(documentContainer).to.exist;
		});

		it("renders slide view", async () => {
			await elementUpdated(element);
			const slideView = element.shadowRoot!.querySelector("slide-view");
			expect(slideView).to.exist;
		});

		it("renders tiles container", async () => {
			await elementUpdated(element);
			const tiles = element.shadowRoot!.querySelector(".tiles");
			expect(tiles).to.exist;
		});

		it("renders grid container", async () => {
			await elementUpdated(element);
			const gridContainer = element.shadowRoot!.querySelector(".grid-container");
			expect(gridContainer).to.exist;
		});

		it("renders resize observer", async () => {
			await elementUpdated(element);
			const resizeObserver = element.shadowRoot!.querySelector("sl-resize-observer");
			expect(resizeObserver).to.exist;
		});
	});

	describe("tilesPerPage property", () => {
		it("defaults to 1", () => {
			expect(element.tilesPerPage).to.equal(1);
		});

		it("can be set via attribute", async () => {
			element.tilesPerPage = 4;
			await elementUpdated(element);
			expect(element.tilesPerPage).to.equal(4);
		});
	});

	describe("layout property", () => {
		it("reflects to attribute when set", async () => {
			element.layout = ContentLayout.PresentationBottom;
			await elementUpdated(element);
			expect(element.hasAttribute("layout")).to.be.true;
		});
	});

	describe("contentFocus property", () => {
		it("reflects to attribute when set", async () => {
			element.contentFocus = ContentFocus.Document;
			await elementUpdated(element);
			expect(element.hasAttribute("contentfocus")).to.be.true;
		});
	});

	describe("isSpeaker property", () => {
		it("defaults to false", () => {
			expect(element.isSpeaker).to.be.false;
		});

		it("reflects to attribute when true", async () => {
			element.isSpeaker = true;
			await elementUpdated(element);
			expect(element.hasAttribute("isspeaker")).to.be.true;
		});
	});

	describe("gridElementsLimit property", () => {
		it("defaults to 20", () => {
			expect(element.gridElementsLimit).to.equal(20);
		});
	});

	describe("columnLimit property", () => {
		it("defaults to 5", () => {
			expect(element.columnLimit).to.equal(5);
		});
	});

	describe("rowsLimit property", () => {
		it("defaults to 3", () => {
			expect(element.rowsLimit).to.equal(3);
		});
	});

	describe("gridGap property", () => {
		it("defaults to 5", () => {
			expect(element.gridGap).to.equal(5);
		});
	});

	describe("aspectRatio property", () => {
		it("has default 16:9 aspect ratio", () => {
			expect(element.aspectRatio.x).to.be.closeTo(16 / 9, 0.01);
			expect(element.aspectRatio.y).to.be.closeTo(9 / 16, 0.01);
		});
	});

	describe("setContentLayout", () => {
		it("sets layout property", () => {
			element.setContentLayout(ContentLayout.PresentationLeft);
			expect(element.layout).to.equal(ContentLayout.PresentationLeft);
		});
	});

	describe("navigation buttons", () => {
		it("renders top-left navigation button", async () => {
			await elementUpdated(element);
			const button = element.shadowRoot!.querySelector("#top-left-button");
			expect(button).to.exist;
		});

		it("renders bottom-right navigation button", async () => {
			await elementUpdated(element);
			const button = element.shadowRoot!.querySelector("#bottom-right-button");
			expect(button).to.exist;
		});

		it("disables prev button when at start", async () => {
			element.viewIndex = 0;
			await elementUpdated(element);

			const button = element.shadowRoot!.querySelector("#top-left-button") as HTMLElement;
			expect(button.hasAttribute("disabled")).to.be.true;
		});
	});

	describe("grid state", () => {
		it("initializes gridCounter to 0", () => {
			expect(element.gridCounter).to.equal(0);
		});

		it("initializes gridColumns to 0", () => {
			expect(element.gridColumns).to.equal(0);
		});

		it("initializes gridRows to 0", () => {
			expect(element.gridRows).to.equal(0);
		});
	});

	describe("addGridElement", () => {
		it("increments grid counter", async () => {
			await elementUpdated(element);

			const mockView = document.createElement("div") as any;
			mockView.isVisible = false;

			element.addGridElement(mockView);

			expect(element.gridCounter).to.equal(1);
		});

		it("sets isVisible on first elements", async () => {
			await elementUpdated(element);

			const mockView = document.createElement("div") as any;
			mockView.isVisible = false;

			element.addGridElement(mockView);

			expect(mockView.isVisible).to.be.true;
		});

		it("appends view to grid container", async () => {
			await elementUpdated(element);

			const mockView = document.createElement("div") as any;
			mockView.isVisible = false;

			element.addGridElement(mockView);

			expect(element.gridContainer.contains(mockView)).to.be.true;
		});
	});
});

