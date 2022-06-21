import { P2PMessage } from "./message";
import { P2PMessageType } from "./message-type";

export class P2PDocumentMessage extends P2PMessage {

	/** The documents's content buffer. */
	readonly buffer: ArrayBuffer;


	constructor(peerId: bigint, buffer: ArrayBuffer) {
		super(P2PMessageType.Document, peerId);

		this.buffer = buffer;
	}
}