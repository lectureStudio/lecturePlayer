import { PageViewport, RenderTask } from "pdfjs-dist";
import { Rectangle } from "../geometry/rectangle";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { Transform } from "../geometry/transform";

export class PdfRenderer {

	private renderTask: RenderTask | null = null;


	async render(pageProxy: PDFPageProxy, context: CanvasRenderingContext2D, transform: Transform, viewRegion: Rectangle): Promise<void> {
		if (this.renderTask) {
			return;
		}

		const viewport: PageViewport = pageProxy.getViewport({
			scale: 1,
			dontFlip: false
		});

		context.canvas.width = viewRegion.width;
		context.canvas.height = viewRegion.height;

		this.renderTask = pageProxy.render({
			canvasContext: context,
			viewport: viewport,
			transform: transform.getMatrix()
		});

		return this.renderTask.promise.then(() => {
			this.renderTask = null;
		},
		(reason: string) => {
			console.error(reason);
		});
	}
}