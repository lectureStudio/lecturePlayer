import { StreamPageAction } from "./stream.page.action";

class StreamPageSelectedAction extends StreamPageAction {

	constructor(documentId: bigint, pageNumber: number) {
		super(documentId, pageNumber);
	}
}

export { StreamPageSelectedAction };