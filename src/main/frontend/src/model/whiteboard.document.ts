import { Page } from "./page";
import { SlideDocument } from "./document";
import { WhiteboardRenderer } from "../render/whiteboard.renderer";
import { Rectangle } from "../geometry/rectangle";
import { Dimension } from "../geometry/dimension";

class WhiteboardDocument extends SlideDocument {

	private readonly renderer: WhiteboardRenderer;


	constructor() {
		super();

		this.renderer = new WhiteboardRenderer();
		this.loadPages()
	}

	override getPageBounds(pageNumber: number): Promise<Rectangle> {
		return new Promise<Rectangle>(resolve => {
			resolve(new Rectangle(0, 0, 640, 480));
		});
	}

	override async getPageText(pageNumber: number): Promise<string> {
		return Promise.resolve("");
	}

	override renderPage(pageNumber: number, context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		return this.renderer.render(context, viewRect, dirtyRegion);
	}

	override renderPageText(pageNumber: number, root: HTMLElement, size: Dimension, viewRect: Rectangle): void {
		// No-op
	}

	private loadPages(): void {
		this.pages = [];

		for (let i = 0; i < 300; i++) {
			this.pages.push(new Page(this, i));
		}
	}
}

export { WhiteboardDocument };