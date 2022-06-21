import { P2PMessage } from "../message/message";
import { P2PTransmitter } from "./transmitter";

export class P2PDataChannelTransmitter implements P2PTransmitter {

	private dataChannel: RTCDataChannel;


	constructor() {
		const connection = new RTCPeerConnection();

		this.dataChannel = connection.createDataChannel("peer-channel", {
			ordered: true,
			protocol: "p2p"
		});
		this.dataChannel.onopen = (event) => {
			console.log("DataChannel opened");
		};
		this.dataChannel.onclose = (event) => {
			console.log("DataChannel closed");
		};
		this.dataChannel.onerror = (event) => {
			console.error("DataChannel error", event);
		};
		this.dataChannel.onmessage = (event) => {
			console.log("DataChannel data", event);
		};
	}

	sendMessage(message: P2PMessage): void {
		this.dataChannel.send(message.toArrayBuffer());
	}

}