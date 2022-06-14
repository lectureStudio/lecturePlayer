import { Dimension } from "../geometry/dimension";
import { Rectangle } from "../geometry/rectangle";
import { Page } from "./page";

abstract class SlideDocument {

	protected pages: Page[];

	private documentId: bigint;


	abstract getPageText(pageNumber: number): Promise<string>;

	abstract renderPage(pageNumber: number, context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<CanvasImageSource>;

	abstract renderPageText(pageNumber: number, root: HTMLElement, size: Dimension, viewRect: Rectangle): void;


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

export { SlideDocument };