import { getDocument } from 'pdfjs-dist';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { PdfJsDocument } from '../model/pdf-js-document';
import { SlideDocument } from '../model/document';

export class DocumentService {

	loadDocument(source: Uint8Array): Promise<SlideDocument> {
		return new Promise<PdfJsDocument>((resolve, reject) => {
			const loadingTask = getDocument(source);
			loadingTask.promise
				.then((pdf: PDFDocumentProxy) => {
					resolve(new PdfJsDocument(pdf));
				})
				.catch((reason: string) => {
					reject(reason);
				});
		});
	}

}