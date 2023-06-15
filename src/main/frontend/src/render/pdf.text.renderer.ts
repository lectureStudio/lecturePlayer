import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { renderTextLayer } from "pdfjs-dist";
import { Transform } from "../geometry/transform";

export class PdfTextRenderer {

	async render(pageProxy: PDFPageProxy, transform: Transform, root: HTMLElement): Promise<void> {
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