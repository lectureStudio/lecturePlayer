import { RecordedPage } from "../model/recorded-page";
import { StreamAction } from "./stream.action";

export class StreamPageActionsAction extends StreamAction {

	readonly documentId: bigint;

	readonly recordedPage: RecordedPage;


	constructor(documentId: bigint, recPage: RecordedPage) {
		super();

		this.documentId = documentId;
		this.recordedPage = recPage;
	}

	toBuffer(): ArrayBuffer {
		throw new Error("Method not implemented.");
	}
}