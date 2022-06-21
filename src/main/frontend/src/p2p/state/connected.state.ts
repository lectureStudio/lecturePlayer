import { DocumentService } from "../../service/document.service";
import { P2PDocumentMessage } from "../message/document.message";
import { P2PMessage } from "../message/message";
import { P2PMessageType } from "../message/message-type";
import { P2PStateHandler } from "../state-handler";
import { P2PState } from "./state";

export class P2PConnectedState implements P2PState {

	private documentService: DocumentService;


	initialize(handler: P2PStateHandler): void {
		this.documentService = new DocumentService();

		const peer = handler.peers[0];

		// Try to retrieve the document state.
		handler.sendMessageToPeer(new P2PMessage(P2PMessageType.Document, handler.getPeerId()), peer);
	}

	handleMessage(handler: P2PStateHandler, message: P2PMessage): void {
		if (message instanceof P2PDocumentMessage) {
			const byteBuffer = new Uint8Array(message.buffer);

			this.documentService.loadDocument(byteBuffer)
				.then(document => {
					
				})
				.catch(error => {
					console.error(error);
				});
		}
	}

}