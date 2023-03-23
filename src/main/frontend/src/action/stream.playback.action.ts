import { Action } from "./action";
import { StreamActionType } from "./stream.action-type";
import { StreamPageAction } from "./stream.page.action";

export class StreamPagePlaybackAction extends StreamPageAction {

	readonly action: Action;


	constructor(documentId: bigint, pageNumber: number, action: Action) {
		super(documentId, pageNumber);

		this.action = action;
		this.actionType = StreamActionType.STREAM_PAGE_ACTION;
	}

	override toBuffer(): ArrayBuffer {
		const actionBuffer = this.action.toBuffer();
		const buffer = new Uint8Array(17 + actionBuffer.byteLength);

		const view = new DataView(buffer.buffer);
		// Write header
		view.setInt32(0, 12);
		view.setInt8(4, this.actionType);

		view.setBigInt64(5, BigInt(this.documentId));
		view.setInt32(13, this.pageNumber);

		buffer.set(new Uint8Array(actionBuffer), 17);

		return buffer;
	}
}