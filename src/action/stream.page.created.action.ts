import { StreamActionType } from "./stream.action-type";
import { StreamPageAction } from "./stream.page.action";

export class StreamPageCreatedAction extends StreamPageAction {

	constructor(documentId: bigint, pageNumber: number) {
		super(documentId, pageNumber);

		this.actionType = StreamActionType.STREAM_PAGE_CREATED;
	}
}