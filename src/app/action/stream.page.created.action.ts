import { StreamPageAction } from "./stream.page.action";
import {StreamActionType} from "./stream.action-type";

class StreamPageCreatedAction extends StreamPageAction {

	constructor(documentId: bigint, pageNumber: number) {
		super(documentId, pageNumber);
	}

	override getType(): StreamActionType {
		return StreamActionType.STREAM_PAGE_CREATED;
	}
}

export { StreamPageCreatedAction };