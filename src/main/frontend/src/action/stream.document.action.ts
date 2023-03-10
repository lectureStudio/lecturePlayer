import { StreamAction } from "./stream.action";
import { DocumentType } from "../model/document.type";
import { StreamActionType } from "./stream.action-type";

export class StreamDocumentAction extends StreamAction {

	readonly documentId: bigint;

	readonly documentType: DocumentType;

	readonly documentTitle: string;

	readonly documentFile: string;

	protected actionType: StreamActionType;


	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super();

		this.documentId = documentId;
		this.documentType = documentType;
		this.documentTitle = documentTitle;
		this.documentFile = documentFile;
	}

	override toBuffer(): ArrayBuffer {
		const encoder = new TextEncoder();

		let titleBuffer: Uint8Array;
		let fileNameBuffer: Uint8Array;

		let titleLength = 0;
		let fileNameLength = 0;
		let payloadLength = 8;

		if (this.documentTitle) {
			titleBuffer = encoder.encode(this.documentTitle);
			titleLength = titleBuffer.length;
			payloadLength += titleLength;
		}
		if (this.documentFile) {
			fileNameBuffer = encoder.encode(this.documentFile);
			fileNameLength = fileNameBuffer.length;
			payloadLength += fileNameLength;
		}

		const buffer = new ArrayBuffer(payloadLength + 22);

		const view = new DataView(buffer);
		// Write header
		view.setInt32(0, payloadLength + 14);
		view.setInt8(4, this.actionType);

		view.setBigInt64(5, BigInt(this.documentId));
		view.setInt8(13, this.documentType);
		view.setInt32(14, titleLength);
		view.setInt32(18, fileNameLength);
		view.setInt32(22, 0); // No checksum

		if (titleBuffer) {
			let offset = 26;

			titleBuffer.forEach(byte => {
				view.setUint8(offset++, byte);
			});
		}
		if (fileNameBuffer) {
			let offset = titleLength + 26;

			fileNameBuffer.forEach(byte => {
				view.setUint8(offset++, byte);
			});
		}

		return buffer;
	}
}