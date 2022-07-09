import { StreamPageAction } from "./stream.page.action";

class StreamPageCreatedAction extends StreamPageAction {

	constructor(documentId: bigint, pageNumber: number) {
		super(documentId, pageNumber);
	}
}

export { StreamPageCreatedAction };