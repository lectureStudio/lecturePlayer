import { StreamAction } from "./stream.action";
import { DocumentType } from "../model/document.type";
import {StreamActionType} from "./stream.action-type";

class StreamDocumentAction extends StreamAction {

	readonly documentId: bigint;

	readonly documentType: DocumentType;

	readonly documentTitle: string;

	readonly documentFile: string;


	constructor(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string) {
		super();

		this.documentId = documentId;
		this.documentType = documentType;
		this.documentTitle = documentTitle;
		this.documentFile = documentFile;
	}

	getType(): StreamActionType {
		return StreamActionType.STREAM_PAGE_ACTIONS;
	}

	public override toByteBuffer(): ArrayBuffer {

		let titleBuffer: any[] = [];
		let fileNameBuffer: any[] = [];

		let titleLength = 0;
		let fileNameLength = 0;
		let checksumLength = 0;
		let textLength = 8;

		if (this.documentTitle != null) {
			for (let i = 0; i < this.documentTitle.length; ++i) {
				let code = this.documentTitle.charCodeAt(i);

				titleBuffer = titleBuffer.concat([code]);
			}

			titleLength = titleBuffer.length;
			textLength += titleBuffer.length;
		}
		if (this.documentFile != null) {
			for (let i = 0; i < this.documentFile.length; ++i) {
				let code = this.documentFile.charCodeAt(i);

				fileNameBuffer = fileNameBuffer.concat([code]);
			}

			fileNameLength = fileNameBuffer.length;
			textLength += fileNameBuffer.length;
		}

		let buffer = new ArrayBuffer(22 + textLength);
		let dataView = new DataView(buffer);


		// Write header.
		dataView.setInt32(0, 14 + textLength);
		dataView.setInt8(4, this.getType());

		dataView.setBigInt64(5, this.documentId);
		dataView.setInt8(13, this.documentType);
		dataView.setInt32(14, titleLength);
		dataView.setInt32(18, fileNameLength);
		dataView.setInt32(22, checksumLength);

		let byteOffset = 26;

		for (const index in titleBuffer) {
			dataView.setUint8(byteOffset, titleBuffer[index]);
			byteOffset++;
		}

		for (const index in fileNameBuffer) {
			dataView.setUint8(byteOffset, fileNameBuffer[index]);
			byteOffset++;
		}

		console.log(byteOffset);

		return dataView.buffer;
	}
}

export { StreamDocumentAction };