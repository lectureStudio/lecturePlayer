import { RecordedPage } from "../model/recorded-page";
import { StreamAction } from "./stream.action";
import {StreamActionType} from "./stream.action-type";

class StreamPageActionsAction extends StreamAction {

	readonly documentId: bigint;

	readonly recordedPage: RecordedPage;


	constructor(documentId: bigint, recPage: RecordedPage) {
		super();

		this.documentId = documentId;
		this.recordedPage = recPage;
	}

	getType(): StreamActionType {
		return StreamActionType.STREAM_PAGE_ACTIONS;
	}

	// TODO: Implement method to convert actions history to ArrayBuffer
	public override toByteBuffer(): ArrayBuffer {
		// TODO: Iterate complete history to buffer
		let pageData = [];

		let dataView = this.createDataView(pageData.length + 8);

		dataView.setBigInt64(5, this.documentId);


		return dataView.buffer;
	}
}

export { StreamPageActionsAction };