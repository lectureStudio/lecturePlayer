import { Action } from "./action";
import { StreamPageAction } from "./stream.page.action";

class StreamPagePlaybackAction extends StreamPageAction {

	readonly action: Action;


	constructor(documentId: bigint, pageNumber: number, action: Action) {
		super(documentId, pageNumber);

		this.action = action;
	}
}

export { StreamPagePlaybackAction };