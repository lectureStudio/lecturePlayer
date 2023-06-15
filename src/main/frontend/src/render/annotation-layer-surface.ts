import { Page } from "../model/page";
import { PdfAnnotationRenderer } from "./pdf.annotation.renderer";

export class AnnotationLayerSurface {

	private readonly annotationRenderer: PdfAnnotationRenderer;

	private readonly root: HTMLDivElement;


	constructor(root: HTMLDivElement) {
		this.root = root;
		this.annotationRenderer = new PdfAnnotationRenderer();
	}

	render(page: Page) {
		// Clear previous annotation elements.
		this.root.replaceChildren();

		this.annotationRenderer.render(page.getPageProxy(), this.root);
	}
}