import { P2PMessage } from "../message/message";
import { P2PStateHandler } from "../state-handler";
import { P2PState } from "./state";

export class P2PIdleState implements P2PState {

	initialize(handler: P2PStateHandler): void {
		// Nothing to do.
	}

	handleMessage(handler: P2PStateHandler, message: P2PMessage): void {
		// Nothing to do.
	}

}