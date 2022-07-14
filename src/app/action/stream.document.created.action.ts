import { StreamDocumentAction } from "./stream.document.action";
import { DocumentType } from "../model/document.type";
import {StreamActionType} from "./stream.action-type";

class StreamDocumentCreatedAction extends StreamDocumentAction {

	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super(documentId, documentType, documentTitle, documentFile);
	}

	override getType(): StreamActionType {
		return StreamActionType.STREAM_DOCUMENT_CREATED;
	}
}

export { StreamDocumentCreatedAction };