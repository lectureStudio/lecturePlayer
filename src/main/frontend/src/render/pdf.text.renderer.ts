import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { renderTextLayer } from "pdfjs-dist";

export class PdfTextRenderer {

	async render(pageProxy: PDFPageProxy, root: HTMLElement): Promise<void> {
		const viewport = pageProxy.getViewport().clone({ dontFlip: true });

		const readableStream = pageProxy.streamTextContent({
			includeMarkedContent: true,
			disableNormalization: true,
		});

		const textLayerRenderTask = renderTextLayer({
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