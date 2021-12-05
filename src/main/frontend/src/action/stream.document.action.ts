import { StreamAction } from "./stream.action";
import { DocumentType } from "../model/document.type";

class StreamDocumentAction extends StreamAction {

	readonly documentId: bigint;

	readonly documentType: DocumentType;

	readonly documentTitle: string;

	readonly documentFile: string;


	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super();

		this.documentId = documentId;
		this.documentType = documentType;
		this.documentTitle = documentTitle;
		this.documentFile = documentFile;
	}
}

export { StreamDocumentAction };