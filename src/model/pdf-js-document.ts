import { Page } from "./page";
import { SlideDocument } from "./document";
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';

export class PdfJsDocument extends SlideDocument {

	static async create(document: PDFDocumentProxy) {
		const pdfjsDoc = new PdfJsDocument();
		await pdfjsDoc.loadPages(document);

		return pdfjsDoc;
	}


	constructor() {
		super();
	}

	private async loadPages(document: PDFDocumentProxy): Promise<void> {
		this.pages = [];

		for (let i = 0; i < document.numPages; i++) {
			this.pages.push(new Page(this, await document.getPage(i + 1), i));
		}
	}
}