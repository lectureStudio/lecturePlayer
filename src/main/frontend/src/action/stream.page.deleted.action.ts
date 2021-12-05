import { StreamPageAction } from "./stream.page.action";

class StreamPageDeletedAction extends StreamPageAction {

	constructor(documentId: bigint, pageNumber: number) {
		super(documentId, pageNumber);
	}
}

export { StreamPageDeletedAction };