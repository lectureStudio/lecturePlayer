import { StreamDocumentAction } from "./stream.document.action";
import { DocumentType } from "../model/document.type";

class StreamDocumentClosedAction extends StreamDocumentAction {

	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super(documentId, documentType, documentTitle, documentFile);
	}
}

export { StreamDocumentClosedAction };