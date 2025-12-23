import { expect } from "@open-wc/testing";
import { StreamDocumentAction } from "./stream.document.action.js";
import { StreamDocumentCreatedAction } from "./stream.document.created.action.js";
import { StreamDocumentClosedAction } from "./stream.document.closed.action.js";
import { StreamDocumentSelectedAction } from "./stream.document.selected.action.js";
import { DocumentType } from "../model/document.type.js";
import { StreamActionType } from "./stream.action-type.js";

describe("StreamDocumentAction", () => {
	describe("constructor", () => {
		it("stores document properties", () => {
			const docId = BigInt(123);
			const docType = DocumentType.PDF;
			const title = "Test Document";
			const file = "test.pdf";

			const action = new StreamDocumentCreatedAction(docId, docType, title, file);

			expect(action.documentId).to.equal(docId);
			expect(action.documentType).to.equal(docType);
			expect(action.documentTitle).to.equal(title);
			expect(action.documentFile).to.equal(file);
		});

		it("handles whiteboard document type", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.WHITEBOARD,
				"Whiteboard",
				"board.wb"
			);

			expect(action.documentType).to.equal(DocumentType.WHITEBOARD);
		});

		it("handles quiz document type", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.QUIZ,
				"Quiz",
				"quiz.json"
			);

			expect(action.documentType).to.equal(DocumentType.QUIZ);
		});

		it("handles empty title and file", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"",
				""
			);

			expect(action.documentTitle).to.equal("");
			expect(action.documentFile).to.equal("");
		});
	});

	describe("toBuffer", () => {
		it("creates valid buffer with title and file", () => {
			const docId = BigInt(456);
			const title = "My Document";
			const file = "document.pdf";
			const action = new StreamDocumentCreatedAction(docId, DocumentType.PDF, title, file);

			const buffer = action.toBuffer();

			expect(buffer).to.be.instanceOf(ArrayBuffer);
			expect(buffer.byteLength).to.be.greaterThan(0);

			// Verify header and document ID
			const view = new DataView(buffer);
			const storedDocId = view.getBigInt64(5);
			expect(storedDocId).to.equal(docId);

			// Verify document type
			const storedType = view.getInt8(13);
			expect(storedType).to.equal(DocumentType.PDF);

			// Verify title length
			const titleLength = view.getInt32(14);
			expect(titleLength).to.equal(new TextEncoder().encode(title).length);

			// Verify file name length
			const fileLength = view.getInt32(18);
			expect(fileLength).to.equal(new TextEncoder().encode(file).length);
		});

		it("creates valid buffer with empty title", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"",
				"file.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			const titleLength = view.getInt32(14);
			expect(titleLength).to.equal(0);
		});

		it("creates valid buffer with empty file", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"Title",
				""
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			const fileLength = view.getInt32(18);
			expect(fileLength).to.equal(0);
		});

		it("creates valid buffer with both empty", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"",
				""
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			expect(view.getInt32(14)).to.equal(0); // title length
			expect(view.getInt32(18)).to.equal(0); // file length
		});

		it("handles unicode characters in title", () => {
			const title = "Документ с юникодом 日本語";
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				title,
				"doc.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			const titleLength = view.getInt32(14);
			expect(titleLength).to.equal(new TextEncoder().encode(title).length);
		});

		it("handles unicode characters in file name", () => {
			const file = "文档.pdf";
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"Document",
				file
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			const fileLength = view.getInt32(18);
			expect(fileLength).to.equal(new TextEncoder().encode(file).length);
		});

		it("sets checksum length to 0", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"Title",
				"file.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);

			const checksumLength = view.getInt32(22);
			expect(checksumLength).to.equal(0);
		});
	});
});

describe("StreamDocumentCreatedAction", () => {
	describe("constructor", () => {
		it("sets action type to STREAM_DOCUMENT_CREATED", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(1),
				DocumentType.PDF,
				"Test",
				"test.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);
			const actionType = view.getInt8(4);

			expect(actionType).to.equal(StreamActionType.STREAM_DOCUMENT_CREATED);
		});
	});

	describe("inheritance", () => {
		it("inherits from StreamDocumentAction", () => {
			const action = new StreamDocumentCreatedAction(
				BigInt(100),
				DocumentType.PDF,
				"Title",
				"file.pdf"
			);

			expect(action.documentId).to.equal(BigInt(100));
			expect(action.documentTitle).to.equal("Title");
		});
	});
});

describe("StreamDocumentClosedAction", () => {
	describe("constructor", () => {
		it("sets action type to STREAM_DOCUMENT_CLOSED", () => {
			const action = new StreamDocumentClosedAction(
				BigInt(1),
				DocumentType.PDF,
				"Test",
				"test.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);
			const actionType = view.getInt8(4);

			expect(actionType).to.equal(StreamActionType.STREAM_DOCUMENT_CLOSED);
		});
	});

	describe("properties", () => {
		it("stores all document properties", () => {
			const docId = BigInt(200);
			const action = new StreamDocumentClosedAction(
				docId,
				DocumentType.WHITEBOARD,
				"Closed Document",
				"closed.wb"
			);

			expect(action.documentId).to.equal(docId);
			expect(action.documentType).to.equal(DocumentType.WHITEBOARD);
			expect(action.documentTitle).to.equal("Closed Document");
			expect(action.documentFile).to.equal("closed.wb");
		});
	});
});

describe("StreamDocumentSelectedAction", () => {
	describe("constructor", () => {
		it("sets action type to STREAM_DOCUMENT_SELECTED", () => {
			const action = new StreamDocumentSelectedAction(
				BigInt(1),
				DocumentType.PDF,
				"Test",
				"test.pdf"
			);

			const buffer = action.toBuffer();
			const view = new DataView(buffer);
			const actionType = view.getInt8(4);

			expect(actionType).to.equal(StreamActionType.STREAM_DOCUMENT_SELECTED);
		});
	});

	describe("properties", () => {
		it("stores all document properties", () => {
			const docId = BigInt(300);
			const action = new StreamDocumentSelectedAction(
				docId,
				DocumentType.QUIZ,
				"Selected Quiz",
				"quiz.json"
			);

			expect(action.documentId).to.equal(docId);
			expect(action.documentType).to.equal(DocumentType.QUIZ);
			expect(action.documentTitle).to.equal("Selected Quiz");
			expect(action.documentFile).to.equal("quiz.json");
		});
	});
});

describe("StreamDocumentAction buffer round-trip", () => {
	it("can be parsed back from buffer", () => {
		const docId = BigInt(999);
		const title = "Round Trip Test";
		const file = "roundtrip.pdf";
		const action = new StreamDocumentCreatedAction(docId, DocumentType.PDF, title, file);

		const buffer = action.toBuffer();
		const view = new DataView(buffer);

		// Read back values
		const parsedDocId = view.getBigInt64(5);
		const parsedType = view.getInt8(13);
		const titleLength = view.getInt32(14);
		const fileLength = view.getInt32(18);

		// Read title
		const decoder = new TextDecoder();
		const titleBytes = new Uint8Array(buffer, 26, titleLength);
		const parsedTitle = decoder.decode(titleBytes);

		// Read file
		const fileBytes = new Uint8Array(buffer, 26 + titleLength, fileLength);
		const parsedFile = decoder.decode(fileBytes);

		expect(parsedDocId).to.equal(docId);
		expect(parsedType).to.equal(DocumentType.PDF);
		expect(parsedTitle).to.equal(title);
		expect(parsedFile).to.equal(file);
	});
});

