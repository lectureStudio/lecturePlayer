import { P2PMessage } from "../message/message";

/**
 * There are different ways to interact with P2P servers and peers. This
 * interface defines an abstraction layer for the various transport
 * protocols. It's up to the specific implementation how the messages are
 * received and transmitted.
 *
 * @author Alex Andres
 */
export interface P2PTransmitter {

	/**
	 * Send the provided message to a remote peer.
	 *
	 * @param message The message to send.
	 */
	sendMessage(message: P2PMessage): void;

}