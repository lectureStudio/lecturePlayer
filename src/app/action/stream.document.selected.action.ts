import { StreamDocumentAction } from "./stream.document.action";
import { DocumentType } from "../model/document.type";
import {StreamActionType} from "./stream.action-type";

class StreamDocumentSelectedAction extends StreamDocumentAction {

	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super(documentId, documentType, documentTitle, documentFile);
	}

	override getType(): StreamActionType {
		return StreamActionType.STREAM_DOCUMENT_SELECTED;
	}

}

export { StreamDocumentSelectedAction };