import { html } from "lit";
import { expect, fixture } from "@open-wc/testing";
import { SlideRenderSurface } from "./slide-render-surface.js";
import { Rectangle } from "../geometry/rectangle.js";
import { SlideDocument } from "../model/document.js";
import { Transform } from "../geometry/transform.js";
import * as pdfjs from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { PdfJsDocument } from "../model/pdf-js-document.js";
import jsPDF from "jspdf";

// Configure PDF.js worker for tests
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";

describe("SlideRenderSurface", function() {
	// Increase timeout for PDF.js worker initialization
	this.timeout(10000);
	let canvas: HTMLCanvasElement;
	let region: Rectangle;
	let surface: SlideRenderSurface;
	let document: SlideDocument;
	let transform: Transform;

	beforeEach(async () => {
		canvas = await fixture(html`<canvas></canvas>`);

		surface = new SlideRenderSurface(canvas);
		region = new Rectangle(0, 0, 320, 240);
		document = await createDocument(3);
		transform = new Transform();
	});

	it("render page on empty canvas", async () => {
		try {
			await surface.render(document.getPage(0), transform, region);
		}
		catch (err) {
			expect(err).to.equal("Surface has no real size");
		}
	});

	it("render page", async () => {
		canvas.style.width = "320px";
		canvas.style.height = "240px";

		await surface.render(document.getPage(0), transform, region);
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
		const loadingTask = pdfjs.getDocument(buffer);
		loadingTask.promise
			.then(async (pdf: PDFDocumentProxy) => {
				resolve(await PdfJsDocument.create(pdf));
			})
			.catch((reason: string) => {
				reject(reason);
			});
	});
}