import { Page } from "../model/page";
import { PdfTextRenderer } from "./pdf.text.renderer";

export class TextLayerSurface {

	private readonly textRenderer: PdfTextRenderer;

	private readonly root: HTMLElement;


	constructor(root: HTMLElement) {
		this.root = root;
		this.textRenderer = new PdfTextRenderer();
	}

	render(page: Page) {
		// Clear previous text elements.
		this.root.replaceChildren();

		this.textRenderer.render(page.getPageProxy(), this.root);
	}
}