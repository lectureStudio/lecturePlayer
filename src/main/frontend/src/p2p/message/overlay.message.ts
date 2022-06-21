import { P2PPeer } from "../peer";
import { P2PMessage } from "./message";
import { P2PMessageType } from "./message-type";

export class P2POverlayMessage extends P2PMessage {

	/** All relevant peers in the overlay. */
	readonly peers: P2PPeer[];


	constructor(peerId: bigint, peers: P2PPeer[]) {
		super(P2PMessageType.Overlay, peerId);

		this.peers = peers;
	}
}