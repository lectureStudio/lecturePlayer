import { Rectangle } from "../geometry/rectangle";
import { RenderSurface } from "./render-surface";
import { PdfRenderer } from "./pdf.renderer";
import { Page } from "../model/page";
import { Transform } from "../geometry/transform";

export class SlideRenderSurface extends RenderSurface {

	private readonly renderer: PdfRenderer;


	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.renderer = new PdfRenderer();
	}

	async render(page: Page, transform: Transform, viewRegion: Rectangle): Promise<void> {
		if (!this.canvasContext.canvas.style.width || !this.canvasContext.canvas.style.height) {
			return new Promise((resolve, reject) => {
				reject("Surface has no real size");
			});
		}

		await this.renderer.render(page.getPageProxy(), this.canvasContext, transform, viewRegion);
	}
}