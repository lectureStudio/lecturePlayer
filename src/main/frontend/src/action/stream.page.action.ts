import { StreamAction } from "./stream.action";

class StreamPageAction extends StreamAction {

	readonly documentId: bigint;

	readonly pageNumber: number;


	constructor(documentId: bigint, pageNumber: number) {
		super();

		this.documentId = documentId;
		this.pageNumber = pageNumber;
	}
}

export { StreamPageAction };