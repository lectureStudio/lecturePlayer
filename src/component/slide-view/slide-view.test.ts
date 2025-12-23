import { html } from "lit";
import { fixture, expect, elementUpdated } from "@open-wc/testing";

import type { SlideView } from "./slide-view.js";
import "./slide-view.js";

describe("SlideView", () => {
	let element: SlideView;

	beforeEach(async () => {
		element = await fixture(html`<slide-view></slide-view>`);
	});

	describe("rendering", () => {
		it("renders the component", () => {
			expect(element).to.exist;
			expect(element.tagName.toLowerCase()).to.equal("slide-view");
		});

		it("has shadow root", () => {
			expect(element.shadowRoot).to.exist;
		});
	});

	describe("canvas elements", () => {
		it("renders slide container", async () => {
			await elementUpdated(element);
			const container = element.shadowRoot!.querySelector(".slide-container");
			expect(container).to.exist;
		});

		it("renders slide canvas", async () => {
			await elementUpdated(element);
			const canvas = element.shadowRoot!.querySelector(".slide-canvas");
			expect(canvas).to.exist;
			expect(canvas!.tagName.toLowerCase()).to.equal("canvas");
		});

		it("renders action canvas", async () => {
			await elementUpdated(element);
			const canvas = element.shadowRoot!.querySelector(".action-canvas");
			expect(canvas).to.exist;
			expect(canvas!.tagName.toLowerCase()).to.equal("canvas");
		});

		it("renders volatile canvas", async () => {
			await elementUpdated(element);
			const canvas = element.shadowRoot!.querySelector(".volatile-canvas");
			expect(canvas).to.exist;
			expect(canvas!.tagName.toLowerCase()).to.equal("canvas");
		});
	});

	describe("layer elements", () => {
		it("renders text layer", async () => {
			await elementUpdated(element);
			const textLayer = element.shadowRoot!.querySelector(".text-layer");
			expect(textLayer).to.exist;
			expect(textLayer!.tagName.toLowerCase()).to.equal("div");
		});

		it("renders annotation layer", async () => {
			await elementUpdated(element);
			const annotationLayer = element.shadowRoot!.querySelector(".annotation-layer");
			expect(annotationLayer).to.exist;
			expect(annotationLayer!.tagName.toLowerCase()).to.equal("div");
		});
	});

	describe("textLayerEnabled property", () => {
		it("defaults to true", () => {
			expect(element.textLayerEnabled).to.be.true;
		});

		it("reflects to attribute", () => {
			expect(element.hasAttribute("textlayerenabled")).to.be.true;
		});

		it("can be set to false", async () => {
			element.textLayerEnabled = false;
			await elementUpdated(element);
			expect(element.textLayerEnabled).to.be.false;
		});
	});

	describe("render surfaces", () => {
		it("initializes slide render surface after firstUpdated", async () => {
			await elementUpdated(element);
			const surface = element.getSlideRenderSurface();
			expect(surface).to.exist;
		});

		it("initializes action render surface after firstUpdated", async () => {
			await elementUpdated(element);
			const surface = element.getActionRenderSurface();
			expect(surface).to.exist;
		});

		it("initializes volatile render surface after firstUpdated", async () => {
			await elementUpdated(element);
			const surface = element.getVolatileRenderSurface();
			expect(surface).to.exist;
		});

		it("initializes text layer surface after firstUpdated", async () => {
			await elementUpdated(element);
			const surface = element.getTextLayerSurface();
			expect(surface).to.exist;
		});

		it("initializes annotation layer surface after firstUpdated", async () => {
			await elementUpdated(element);
			const surface = element.getAnnotationLayerSurface();
			expect(surface).to.exist;
		});
	});

	describe("setRenderController", () => {
		it("accepts render controller", async () => {
			await elementUpdated(element);
			const mockController = { render: () => {}, getPage: () => null };

			// Should not throw
			element.setRenderController(mockController as any);
		});
	});

	describe("updateSurfaceSize", () => {
		it("can be called without error", async () => {
			await elementUpdated(element);
			// Should not throw even without render controller
			element.updateSurfaceSize();
		});
	});

	describe("mouse listener", () => {
		it("addMouseListener does not throw", async () => {
			await elementUpdated(element);
			const mockListener = {
				registerElement: () => {},
				unregisterElement: () => {}
			};

			// Should not throw
			element.addMouseListener(mockListener as any);
		});

		it("removeMouseListener does not throw", async () => {
			await elementUpdated(element);
			const mockListener = {
				registerElement: () => {},
				unregisterElement: () => {}
			};

			// Should not throw
			element.removeMouseListener(mockListener as any);
		});
	});
});

