import { Page } from "./page";

export abstract class SlideDocument {

	protected pages: Page[];

	private documentId: bigint;


	constructor() {

	}

	getDocumentId(): bigint {
		return this.documentId;
	}

	setDocumentId(id: bigint): void {
		this.documentId = id;
	}

	getPageCount(): number {
		return this.pages.length;
	}

	getPage(pageNumber: number): Page {
		if (pageNumber < 0 || pageNumber > this.pages.length - 1) {
			throw new Error(`Page number ${pageNumber} out of bounds.`);
		}
		return this.pages[pageNumber];
	}

	deletePage(pageNumber: number): void {
		this.pages.splice(pageNumber, 1);
	}
}