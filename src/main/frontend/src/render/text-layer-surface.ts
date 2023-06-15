import { Transform } from "../geometry/transform";
import { Page } from "../model/page";
import { PdfTextRenderer } from "./pdf.text.renderer";

export class TextLayerSurface {

	private readonly textRenderer: PdfTextRenderer;

	private readonly root: HTMLElement;


	constructor(root: HTMLElement) {
		this.root = root;
		this.textRenderer = new PdfTextRenderer();
	}

	async render(page: Page, transform: Transform) {
		// Clear previous text elements.
		this.root.replaceChildren();

		await this.textRenderer.render(page.getPageProxy(), transform, this.root);
	}
}