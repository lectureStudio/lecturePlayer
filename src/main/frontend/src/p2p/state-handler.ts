import { P2PMessage } from "./message/message";
import { P2PPeer } from "./peer";
import { P2PConnectingState } from "./state/connecting.state";
import { P2PState } from "./state/state";
import { P2PTransmitter } from "./transmitter/transmitter";

export class P2PStateHandler {

	private readonly peerId: bigint;

	private readonly transmitter: P2PTransmitter;

	private state: P2PState;

	peers: P2PPeer[];


	constructor(peerId: bigint, transmitter: P2PTransmitter) {
		this.peerId = peerId;
		this.transmitter = transmitter;

		this.setState(new P2PConnectingState());
	}

	/**
	 * Gets the identifier of the local peer to which this handler belongs.
	 * 
	 * @returns The local peer's identifier.
	 */
	getPeerId(): bigint {
		return this.peerId;
	}

	/**
	 * Sets the new state to which this handler will transition.
	 * 
	 * @param state The next state.
	 */
	setState(state: P2PState): void {
		this.state = state;

		try {
			state.initialize(this);
		}
		catch (error) {
			console.log(error);
		}
	}

	/**
	 * Processes the received message. The message will be delegated to the
	 * current state.
	 * 
	 * @param message The message to process.
	 */
	handleMessage(message: P2PMessage): void {
		this.state.handleMessage(this, message);
	}

	/**
	 * Sends a message to the remote central server endpoint.
	 * 
	 * @param message The message to send.
	 */
	sendMessage(message: P2PMessage) {
		this.transmitter.sendMessage(message);
	}

	/**
	 * Sends a message to the specified remote peer endpoint.
	 * 
	 * @param message The message to send.
	 * @param peer The recipient of the message.
	 */
	sendMessageToPeer(message: P2PMessage, peer: P2PPeer) {
		this.transmitter.sendMessage(message);
	}
}