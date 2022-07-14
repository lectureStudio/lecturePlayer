import {StreamAction} from "./stream.action";
import {StreamActionType} from "./stream.action-type";

class StreamPageAction extends StreamAction {

	readonly documentId: bigint;

	readonly pageNumber: number;


	constructor(documentId: bigint, pageNumber: number) {
		super();

		this.documentId = documentId;
		this.pageNumber = pageNumber;
	}

	getType(): StreamActionType {
		return StreamActionType.STREAM_PAGE_ACTIONS;
	}

	public override toByteBuffer(): ArrayBuffer {
		let dataView = this.createDataView(12);

		dataView.setBigInt64(5, this.documentId);
		dataView.setInt32(13, this.pageNumber);

		return dataView.buffer;
	}
}

export { StreamPageAction };