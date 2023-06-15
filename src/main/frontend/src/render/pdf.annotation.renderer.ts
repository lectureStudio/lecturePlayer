import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
import { AnnotationLayer } from "pdfjs-dist";
import { GenericL10n } from "pdfjs-dist/web/pdf_viewer";

const pdfViever = require("pdfjs-dist/web/pdf_viewer");

export class PdfAnnotationRenderer {

	private readonly l10n: GenericL10n;


	constructor() {
		this.l10n = new GenericL10n("en-us");
	}

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

			// Process interpolated text.
			this.l10n.translate(root);
		}
	}
}