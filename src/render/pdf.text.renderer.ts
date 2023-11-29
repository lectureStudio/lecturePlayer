import * as pdfjs from "pdfjs-dist";
import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { Transform } from "../geometry/transform";

export class PdfTextRenderer {

	async render(pageProxy: PDFPageProxy, transform: Transform, root: HTMLElement): Promise<void> {
		if (!pdfjs.renderTextLayer) {
			return Promise.reject("renderTextLayer() is not available");
		}

		const viewport = pageProxy.getViewport().clone({ dontFlip: true });

		const readableStream = pageProxy.streamTextContent({
			includeMarkedContent: true,
			disableNormalization: true,
		});

		const textLayerRenderTask = pdfjs.renderTextLayer({
			textContentSource: readableStream,
			container: root,
			viewport,
			textDivs: [],
			textDivProperties: new WeakMap(),
			textContentItemsStr: [],
			isOffscreenCanvasSupported: true
		});

		await textLayerRenderTask.promise;
	}

}