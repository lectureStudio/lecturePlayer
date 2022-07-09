import {getDocument, PDFDocumentProxy} from 'pdfjs-dist';
import { PdfJsDocument } from '../model/pdf-js-document';
import { SlideDocument } from '../model/document';
import {Injectable} from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class DocumentService {

	loadDocument(source: Uint8Array): Promise<SlideDocument> {
		return new Promise<PdfJsDocument>((resolve, reject) => {
			getDocument(source)
				.promise.then((pdf: PDFDocumentProxy) => {
					resolve(new PdfJsDocument(pdf));
				},
				(reason: string) => {
					reject(reason);
				});
		});
	}

}