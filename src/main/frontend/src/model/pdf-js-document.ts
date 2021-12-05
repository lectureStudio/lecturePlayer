import { Page } from "./page";
import { SlideDocument } from "./document";
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist/types/display/api';
import { Rectangle } from "../geometry/rectangle";
import { PdfRenderer } from "../render/pdf.renderer";
import { PdfTextRenderer } from "../render/pdf.text.renderer";
import { Dimension } from "../geometry/dimension";

class PdfJsDocument extends SlideDocument {

	private readonly document: PDFDocumentProxy;

	private readonly renderer: PdfRenderer;

	private readonly textRenderer: PdfTextRenderer;


	constructor(document: PDFDocumentProxy) {
		super();

		this.document = document;
		this.renderer = new PdfRenderer();
		this.textRenderer = new PdfTextRenderer();

		this.loadPages(document)
	}

	async getPageText(pageNumber: number): Promise<string> {
		const page = await this.document.getPage(pageNumber + 1);
		const content = await page.getTextContent();

		return content.items.map(function (s) { return s.str; }).join(' ');
	}

	async renderPage(pageNumber: number, context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		const pageProxy: PDFPageProxy = await this.getPdfPage(pageNumber);

		return this.renderer.render(pageProxy, context, viewRect, dirtyRegion);
	}

	async renderPageText(pageNumber: number, root: HTMLElement, size: Dimension, viewRect: Rectangle): Promise<void> {
		const pageProxy: PDFPageProxy = await this.getPdfPage(pageNumber);

		this.textRenderer.render(pageProxy, root, size, viewRect);
	}

	private getPdfPage(pageNumber: number): Promise<PDFPageProxy> {
		return this.document.getPage(pageNumber + 1);
	}

	private loadPages(document: PDFDocumentProxy): void {
		this.pages = [];

		for (let i = 0; i < document.numPages; i++) {
			this.pages.push(new Page(this, i));
		}
	}
}

export { PdfJsDocument };