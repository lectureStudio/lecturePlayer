import { P2PMessage } from "../message/message";
import { P2PStateHandler } from "../state-handler";

export interface P2PState {

	/**
	 * Initialize this state with the provided {@code P2PStateHandler}. Usually
	 * this is the point where the state sends specific messages to the P2P
	 * central servers or other peers.
	 *
	 * @param handler The {@code P2PStateHandler}.
	 */
	initialize(handler: P2PStateHandler): void;

	/**
	 * Process state specific messages received from P2P central servers and
	 * other peers. Once this state has finished its message handling, it can
	 * transition to another state by invoking {@link P2PStateHandler#setState(P2PState)}.
	 *
	 * @param handler The {@code P2PStateHandler}.
	 * @param message The message to process.
	 */
	handleMessage(handler: P2PStateHandler, message: P2PMessage): void;

}