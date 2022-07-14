import { Action } from "./action";
import { StreamPageAction } from "./stream.page.action";
import {StreamActionType} from "./stream.action-type";

class StreamPagePlaybackAction extends StreamPageAction {

	readonly action: Action;


	constructor(documentId: bigint, pageNumber: number, action: Action) {
		super(documentId, pageNumber);

		this.action = action;
	}

	override getType(): StreamActionType {
		return StreamActionType.STREAM_PAGE_ACTION;
	}
}

export { StreamPagePlaybackAction };