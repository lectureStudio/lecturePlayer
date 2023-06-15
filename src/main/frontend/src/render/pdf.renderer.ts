import { RenderTask } from "pdfjs-dist";
import { Rectangle } from "../geometry/rectangle";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

export class PdfRenderer {

	private renderTask: RenderTask;


	async render(pageProxy: PDFPageProxy, context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<void> {
		if (this.renderTask) {
			return null;
		}

		const scaleX = 1.0 / viewRect.width;
		const scaleTx = dirtyRegion.width * scaleX;

		const tx = viewRect.x * scaleTx;
		const ty = viewRect.y * scaleTx;

		const width = pageProxy.view[2] - pageProxy.view[0];
		const scale = scaleX * (dirtyRegion.width / width);
		const viewport: any = pageProxy.getViewport({
			scale: scale,
			dontFlip: false
		});

		viewport.transform[4] -= tx;
		viewport.transform[5] -= ty;

		context.canvas.width = dirtyRegion.width;
		context.canvas.height = dirtyRegion.height;

		this.renderTask = pageProxy.render({
			canvasContext: context,
			viewport: viewport,
		});

		return this.renderTask.promise.then(() => {
			this.renderTask = null;
		},
		(reason: string) => {
			console.error(reason);
		});
	}
}