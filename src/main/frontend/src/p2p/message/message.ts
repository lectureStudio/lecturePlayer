import { P2PMessageType } from "./message-type";

/**
 * Basic message implementation to communicate with endpoints of the P2P
 * network. The {@code P2PMessage} is meant to be extended by specific
 * message classes as it contains fields that all messages require. With this
 * basic message you can only communicate with the server root, meaning only to
 * create a P2P session.
 *
 * @author Alex Andres
 */
export class P2PMessage {

	/** The message type identifier. */
	readonly type: P2PMessageType;

	/** The peer's local/remote identifier. */
	readonly peerId: bigint;


	constructor(type: P2PMessageType, peerId: bigint) {
		this.type = type;
		this.peerId = peerId;
	}

	getType(): P2PMessageType {
		return this.type;
	}

	getPeerId(): bigint {
		return this.peerId;
	}

	toArrayBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(17);
		const view = new DataView(buffer);

		view.setInt8(0, this.type);
		view.setBigUint64(1, this.peerId);

		return buffer;
	}
}