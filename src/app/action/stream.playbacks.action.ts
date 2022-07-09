import { RecordedPage } from "../model/recorded-page";
import { StreamAction } from "./stream.action";

class StreamPageActionsAction extends StreamAction {

	readonly documentId: bigint;

	readonly recordedPage: RecordedPage;


	constructor(documentId: bigint, recPage: RecordedPage) {
		super();

		this.documentId = documentId;
		this.recordedPage = recPage;
	}
}

export { StreamPageActionsAction };