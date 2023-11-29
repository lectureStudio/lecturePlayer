import { html } from "lit";
import { fixture, expect } from "@open-wc/testing";
import { RenderController } from "./render-controller.js";
import { jsPDF } from "jspdf";
import { SlideDocument } from "../model/document.js";
import { PdfJsDocument } from "../model/pdf-js-document.js";
import { PDFDocumentProxy } from "pdfjs-dist";
import { TextShape } from "../model/shape/text.shape.js";
import { PointerShape } from "../model/shape/pointer.shape.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { PenPoint } from "../geometry/pen-point.js";
import { Font } from "../paint/font.js";
import { Rectangle } from "../geometry/rectangle.js";

import type { SlideView } from "../component/slide-view/slide-view.js";
import "../component/slide-view/slide-view.js";

import "pdfjs-dist/build/pdf.js";

const pdfjsLib = window["pdfjs-dist/build/pdf"];
pdfjsLib.GlobalWorkerOptions.workerSrc = "node_modules/pdfjs-dist/build/pdf.worker.js";

describe("RenderController", () => {
	let controller: RenderController;
	let slideView: SlideView;
	let document: SlideDocument;

	beforeEach(async () => {
		slideView = await fixture(html`<slide-view></slide-view>`);

		controller = new RenderController();
		controller.setSlideView(slideView);

		document = await createDocument(3);
	});

	it("start and stop", () => {
		controller.start();
		controller.stop();

		controller.start();
		controller.setPage(document.getPage(0));
		controller.stop();
	});

	it("set page", () => {
		const page0 = document.getPage(0);
		const page1 = document.getPage(1);

		controller.setPage(page0);
		expect(controller.getPage()).to.equal(page0);

		controller.setPage(page1);
		expect(controller.getPage()).to.equal(page1);

		controller.setSlideView(null);
		controller.setPage(page0);
	});

	it("page rendering", () => {
		slideView.style.width = "320px";
		slideView.style.height = "240px";

		controller.setPage(document.getPage(0));
		controller.setPage(document.getPage(1));
	});

	it("shape rendering", () => {
		const page0 = document.getPage(0);
		const page1 = document.getPage(1);
		const textShape0 = new TextShape(0);
		const textShape1 = new TextShape(0);
		const textShape2 = new TextShape(0);
		const pointerShape = new PointerShape(0, new Brush(Color.fromHex("#000"), 1));

		// Set page with no shapes.
		controller.setPage(page0);

		// Render more than one shape.
		page0.addShape(textShape0);
		page0.addShape(textShape1);

		// Set page with shapes added.
		page1.addShape(textShape2);

		controller.setPage(page1);

		// Remove all shapes.
		page1.clear();

		// Remove single shape.
		controller.setPage(page0);

		page0.removeShape(textShape0);

		// Modify added shape.
		textShape1.setFont(new Font("Arial", 10));
		textShape1.setText("Hello");

		page0.addShape(pointerShape);

		pointerShape.addPoint(PenPoint.createZero());

		// Modify page transform.
		page0.getSlideShape().setPageRect(new Rectangle(0.2, 0.2, 0.8, 0.8));
	});

	it("seek", () => {
		controller.setPage(document.getPage(0));
		controller.beginBulkRender();
		controller.setSeek(true);
		controller.setSeek(false);
		controller.endBulkRender();
	});
});

/**
 * Creates an empty PDF document.
 * 
 * @param pageCount The number of pages in the test document.
 * 
 * @returns a new PdfJsDocument.
 */
function createDocument(pageCount: number) {
	const document = new jsPDF();

	for (let i = 0; i < pageCount; i++) {
		document.addPage();
	}

	const buffer = document.output("arraybuffer");

	return new Promise<SlideDocument>((resolve, reject) => {
		const loadingTask = pdfjsLib.getDocument(buffer);
		loadingTask.promise
			.then(async (pdf: PDFDocumentProxy) => {
				resolve(await PdfJsDocument.create(pdf));
			})
			.catch((reason: string) => {
				reject(reason);
			});
	});
}