import { StreamAction } from "./stream.action";

export class StreamPageAction extends StreamAction {

	readonly documentId: bigint;

	readonly pageNumber: number;


	constructor(documentId: bigint, pageNumber: number) {
		super();

		this.documentId = documentId;
		this.pageNumber = pageNumber;
	}

	override toBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(17);

		const view = new DataView(buffer);
		// Write header
		view.setInt32(0, 12);
		view.setInt8(4, this.actionType);

		view.setBigInt64(5, BigInt(this.documentId));
		view.setInt32(13, this.pageNumber);

		return buffer;
	}
}