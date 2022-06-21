import { P2PMessage } from "../message/message";
import { P2PMessageType } from "../message/message-type";
import { P2POverlayMessage } from "../message/overlay.message";
import { P2PStateHandler } from "../state-handler";
import { P2PConnectedState } from "./connected.state";
import { P2PState } from "./state";

export class P2PConnectingState implements P2PState {

	initialize(handler: P2PStateHandler): void {
		handler.sendMessage(new P2PMessage(P2PMessageType.Overlay, handler.getPeerId()));
	}

	handleMessage(handler: P2PStateHandler, message: P2PMessage): void {
		if (message instanceof P2POverlayMessage) {
			handler.peers = message.peers;
			handler.setState(new P2PConnectedState());
		}
	}

}