import { Dimension } from "../geometry/dimension";
import { PDFPageProxy } from "pdfjs-dist/types/display/api";
import { renderTextLayer } from "pdfjs-dist";
import { Rectangle } from "../geometry/rectangle";

const pdfViever = require("pdfjs-dist/web/pdf_viewer");

class PdfTextRenderer {

	async render(pageProxy: PDFPageProxy, root: HTMLElement, size: Dimension, viewRect: Rectangle): Promise<void> {
		const textContent = await pageProxy.getTextContent();

		const scaleX = 1.0 / viewRect.width;
		const scaleTx = size.width * scaleX;

		const tx = viewRect.x * scaleTx;
		const ty = viewRect.y * scaleTx;

		const width = pageProxy.view[2] - pageProxy.view[0];
		const scale = scaleX * (size.width / width);
		const viewport: any = pageProxy.getViewport({
			scale: scale,
			dontFlip: false
		});

		viewport.transform[4] -= tx;
		viewport.transform[5] -= ty;

		renderTextLayer({
			textContent: textContent,
			container: root,
			viewport: viewport,
			enhanceTextSelection: true,
			textDivs: []
		})
		.promise.catch((reason: any) => {
			console.error(reason);
		});

		const linkService = new pdfViever.PDFLinkService();
		// Open links in new tab.
		linkService.externalLinkTarget = 2;

		const annotationLayer = new pdfViever.AnnotationLayerBuilder({
			pageDiv: root,
			pdfPage: pageProxy,
			linkService: linkService
		});
		annotationLayer.render(viewport);
	}

}

export { PdfTextRenderer };