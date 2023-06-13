import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { AnnotationLayer } from "pdfjs-dist";

const pdfViever = require("pdfjs-dist/web/pdf_viewer");

export class PdfAnnotationRenderer {

	async render(pageProxy: PDFPageProxy, root: HTMLDivElement): Promise<void> {
		const viewport = pageProxy.getViewport().clone({ dontFlip: true });

		const annotations = await pageProxy.getAnnotations();

		if (annotations.length > 0) {
			const linkService = new pdfViever.PDFLinkService();
			// Open links in new tab.
			linkService.externalLinkTarget = 2;

			AnnotationLayer.render({
				viewport: viewport,
				div: root,
				annotations: annotations,
				page: pageProxy,
				linkService: linkService,
				downloadManager: null,
				renderForms: false,
				enableScripting: false,
			});

			// const webL10n = document.webL10n;
			// webL10n.setLanguage("en-US", () => {
			// 	console.log("++++ webL10n set lang");
			// });

			// webL10n.translate(root);
		}
	}

}