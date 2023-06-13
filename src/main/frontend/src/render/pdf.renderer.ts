import { Rectangle } from "../geometry/rectangle";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";

export class PdfRenderer {

	private readonly backCanvas = document.createElement('canvas');

	private renderTask: any;


	async render(pageProxy: PDFPageProxy, context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		if (this.renderTask) {
			this.renderTask.cancel();
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

		this.backCanvas.width = dirtyRegion.width;
		this.backCanvas.height = dirtyRegion.height;

		this.renderTask = pageProxy.render({
			canvasContext: this.backCanvas.getContext("2d", { alpha: false }),
			viewport: viewport,
		});

		return this.renderTask.promise.then(() => {
			this.renderTask = null;

			return this.backCanvas;
		},
		(reason: string) => {
			//console.error(reason);
		});
	}
}