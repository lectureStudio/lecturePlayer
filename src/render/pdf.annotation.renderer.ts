import { PDFPageProxy } from "pdfjs-dist/types/src/display/api";
// import { AnnotationLayer } from "pdfjs-dist";

const pdfViever = require("pdfjs-dist/web/pdf_viewer");

export class PdfAnnotationRenderer {

	private readonly l10n: Translator;


	constructor() {
		this.l10n = new Translator();
	}

	async render(pageProxy: PDFPageProxy, _root: HTMLDivElement): Promise<void> {
		// const viewport = pageProxy.getViewport().clone({ dontFlip: true });

		const annotations = await pageProxy.getAnnotations();

		if (annotations.length > 0) {
			const linkService = new pdfViever.PDFLinkService();
			// Open links in new tab.
			linkService.externalLinkTarget = 2;

			// AnnotationLayer.render({
			// 	viewport: viewport,
			// 	div: root,
			// 	annotations: annotations,
			// 	page: pageProxy,
			// 	linkService: linkService,
			// 	downloadManager: null,
			// 	renderForms: false,
			// 	enableScripting: false,
			// });

			// // Process interpolated text.
			// this.l10n.translate(root);
		}
	}
}

// Taken and modified the webL10n API by Fabien Cazenave for PDF.js extension.
class Translator {

	// Embedded L10n data.
	private readonly gL10nData: object;


	constructor() {
		this.gL10nData = {
			"annotation_date_string": {
				"textContent": "{{date}}, {{time}}"
			}
		}
	}

	translate(element: HTMLElement) {
		element = element || document.querySelector("html");

		// check all translatable children (= w/ a `data-l10n-id' attribute)
		const children = element.querySelectorAll("*[data-l10n-id]");
		const elementCount = children.length;
		for (let i = 0; i < elementCount; i++) {
			this.translateElement(children[i] as HTMLElement);
		}

		// translate element itself if necessary
		if (element.dataset.l10nId) {
			this.translateElement(element);
		}
	}

	private translateElement(element: HTMLElement) {
		if (!element || !element.dataset) {
			return;
		}

		// get the related l10n object
		const key = element.dataset.l10nId;
		if (!key) {
			return;
		}
		const data = (this.gL10nData as Indexable)?.[key] as string[];
		if (!data) {
			return;
		}

		// get arguments (if any)
		// TODO: more flexible parser?
		let args;
		if (element.dataset.l10nArgs) {
			try {
				args = JSON.parse(element.dataset.l10nArgs);
			}
			catch {
				console.warn("[l10n] could not parse arguments for #" + key + "");
			}
		}

		// translate element
		// TODO: security check?
		for (const k in data) {
			(element as unknown as Indexable)[k] = this.substArguments(data[k], args);
		}
	}

	// replace {{arguments}} with their values
	private substArguments(str: string, args: object) {
		const reArgs = /\{\{\s*(.+?)\s*\}\}/g;
		return str.replace(reArgs, (matched_text: string, arg: string): string => {
			if (args && arg in (args as object)) {
				return (args as Indexable)[arg] as string;
			}
			if (arg in this.gL10nData) {
				return (this.gL10nData as Indexable)[arg] as string;
			}
			console.log('argument {{' + arg + '}} is undefined.');
			return matched_text;
		});
	}
}