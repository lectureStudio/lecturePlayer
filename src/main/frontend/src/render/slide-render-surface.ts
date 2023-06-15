import { Rectangle } from "../geometry/rectangle";
import { RenderSurface } from "./render-surface";
import { PdfRenderer } from "./pdf.renderer";
import { Page } from "../model/page";

export class SlideRenderSurface extends RenderSurface {

	private readonly renderer: PdfRenderer;


	constructor(canvas: HTMLCanvasElement) {
		super(canvas);

		this.renderer = new PdfRenderer();
	}

	async render(page: Page, dirtyRegion: Rectangle): Promise<void> {
		if (!this.canvasContext.canvas.style.width || !this.canvasContext.canvas.style.height) {
			return new Promise((resolve, reject) => {
				reject("Surface has no real size");
			});
		}

		const shape = page.getSlideShape();
		const pageRect = shape.bounds;
		const sx = this.canvas.width / pageRect.width;

		this.canvasContext.save();
		this.canvasContext.scale(sx, sx);

		await this.renderer.render(page.getPageProxy(), this.canvasContext, shape.bounds, dirtyRegion);

		this.canvasContext.restore();
	}
}