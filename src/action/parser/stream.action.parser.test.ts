import { expect } from "@open-wc/testing";
import { StreamActionParser } from "./stream.action.parser.js";
import { ProgressiveDataView } from "./progressive-data-view.js";
import { StreamActionType } from "../stream.action-type.js";
import { DocumentType } from "../../model/document.type.js";
import { StreamPagePlaybackAction } from "../stream.playback.action.js";
import { StreamPageActionsAction } from "../stream.playbacks.action.js";
import { StreamPageCreatedAction } from "../stream.page.created.action.js";
import { StreamPageDeletedAction } from "../stream.page.deleted.action.js";
import { StreamPageSelectedAction } from "../stream.page.selected.action.js";
import { StreamDocumentCreatedAction } from "../stream.document.created.action.js";
import { StreamDocumentClosedAction } from "../stream.document.closed.action.js";
import { StreamDocumentSelectedAction } from "../stream.document.selected.action.js";
import { StreamSpeechPublishedAction } from "../stream.speech.published.action.js";
import { ActionType } from "../action-type.js";
import { UndoAction } from "../undo.action.js";

/**
 * Creates a buffer for a page action (created/deleted/selected)
 * Format: [docId(8)] [pageNumber(4)]
 */
function createPageActionBuffer(docId: bigint, pageNumber: number): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	const buffer = new ArrayBuffer(12);
	const dataView = new DataView(buffer);

	dataView.setBigInt64(0, docId);
	dataView.setInt32(8, pageNumber);

	return { buffer, view: new ProgressiveDataView(buffer) };
}

/**
 * Creates a buffer for a document action (created/closed/selected)
 * Format: [docId(8)] [docType(1)] [titleLength(4)] [nameLength(4)] [checksumLength(4)] [title...] [name...] [checksum...]
 */
function createDocumentActionBuffer(
	docId: bigint,
	docType: DocumentType,
	title: string,
	fileName: string,
	checksum: string = ""
): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	const encoder = new TextEncoder();
	const titleBytes = encoder.encode(title);
	const nameBytes = encoder.encode(fileName);
	const checksumBytes = encoder.encode(checksum);

	const totalSize = 8 + 1 + 4 + 4 + 4 + titleBytes.length + nameBytes.length + checksumBytes.length;
	const buffer = new ArrayBuffer(totalSize);
	const dataView = new DataView(buffer);

	let offset = 0;
	dataView.setBigInt64(offset, docId); offset += 8;
	dataView.setInt8(offset, docType); offset += 1;
	dataView.setInt32(offset, titleBytes.length); offset += 4;
	dataView.setInt32(offset, nameBytes.length); offset += 4;
	dataView.setInt32(offset, checksumBytes.length); offset += 4;

	const uint8View = new Uint8Array(buffer);
	uint8View.set(titleBytes, offset); offset += titleBytes.length;
	uint8View.set(nameBytes, offset); offset += nameBytes.length;
	uint8View.set(checksumBytes, offset);

	return { buffer, view: new ProgressiveDataView(buffer) };
}

/**
 * Creates a buffer for a speech action
 * Format: [idLength(4)] [idString...] [nameLength(4)] [nameString...]
 */
function createSpeechActionBuffer(publisherId: string, displayName: string): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	const encoder = new TextEncoder();
	const idBytes = encoder.encode(publisherId);
	const nameBytes = encoder.encode(displayName);

	const totalSize = 4 + idBytes.length + 4 + nameBytes.length;
	const buffer = new ArrayBuffer(totalSize);
	const dataView = new DataView(buffer);

	let offset = 0;
	dataView.setInt32(offset, idBytes.length); offset += 4;
	new Uint8Array(buffer).set(idBytes, offset); offset += idBytes.length;
	dataView.setInt32(offset, nameBytes.length); offset += 4;
	new Uint8Array(buffer).set(nameBytes, offset);

	return { buffer, view: new ProgressiveDataView(buffer) };
}

/**
 * Creates a buffer for a playback action (single action)
 * Format: [docId(8)] [pageNumber(4)] [length(4)] [type(1)] [timestamp(4)] [header(4)]
 */
function createPlaybackActionBuffer(
	docId: bigint,
	pageNumber: number,
	actionType: ActionType,
	timestamp: number
): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	const buffer = new ArrayBuffer(25); // 8 + 4 + 4 + 1 + 4 + 4
	const dataView = new DataView(buffer);

	let offset = 0;
	dataView.setBigInt64(offset, docId); offset += 8;
	dataView.setInt32(offset, pageNumber); offset += 4;
	dataView.setInt32(offset, 9); offset += 4;  // length = type(1) + timestamp(4) + header(4)
	dataView.setInt8(offset, actionType); offset += 1;
	dataView.setInt32(offset, timestamp); offset += 4;
	dataView.setInt32(offset, 0); offset += 4;  // header (no key event)

	return { buffer, view: new ProgressiveDataView(buffer) };
}

/**
 * Creates a buffer for playback actions (recorded page)
 * Format: [docId(8)] [entryLength(4)] [pageNumber(4)] [timestamp(4)] [staticSize(4)] [playbackSize(4)]
 */
function createPlaybackActionsBuffer(
	docId: bigint,
	pageNumber: number,
	pageTimestamp: number
): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	const buffer = new ArrayBuffer(28); // 8 + 4 + 4 + 4 + 4 + 4
	const dataView = new DataView(buffer);

	let offset = 0;
	dataView.setBigInt64(offset, docId); offset += 8;
	dataView.setInt32(offset, 16); offset += 4;  // entryLength (4 + 4 + 4 + 4)
	dataView.setInt32(offset, pageNumber); offset += 4;
	dataView.setInt32(offset, pageTimestamp); offset += 4;
	dataView.setInt32(offset, 0); offset += 4;   // staticActionSize = 0
	dataView.setInt32(offset, 0); offset += 4;   // playbackActionSize = 0

	return { buffer, view: new ProgressiveDataView(buffer) };
}

describe("StreamActionParser", () => {
	describe("STREAM_INIT", () => {
		it("parses stream init action", () => {
			const buffer = new ArrayBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_INIT, 0);

			expect(action).to.not.be.null;
		});
	});

	describe("Page Actions", () => {
		it("parses StreamPageCreatedAction", () => {
			const docId = BigInt(12345);
			const pageNumber = 5;
			const { view } = createPageActionBuffer(docId, pageNumber);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_PAGE_CREATED, 12);

			expect(action).to.be.instanceOf(StreamPageCreatedAction);
			const pageAction = action as StreamPageCreatedAction;
			expect(pageAction.documentId).to.equal(docId);
			expect(pageAction.pageNumber).to.equal(pageNumber);
		});

		it("parses StreamPageDeletedAction", () => {
			const docId = BigInt(67890);
			const pageNumber = 3;
			const { view } = createPageActionBuffer(docId, pageNumber);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_PAGE_DELETED, 12);

			expect(action).to.be.instanceOf(StreamPageDeletedAction);
			const pageAction = action as StreamPageDeletedAction;
			expect(pageAction.documentId).to.equal(docId);
			expect(pageAction.pageNumber).to.equal(pageNumber);
		});

		it("parses StreamPageSelectedAction", () => {
			const docId = BigInt(11111);
			const pageNumber = 10;
			const { view } = createPageActionBuffer(docId, pageNumber);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_PAGE_SELECTED, 12);

			expect(action).to.be.instanceOf(StreamPageSelectedAction);
			const pageAction = action as StreamPageSelectedAction;
			expect(pageAction.documentId).to.equal(docId);
			expect(pageAction.pageNumber).to.equal(pageNumber);
		});
	});

	describe("Document Actions", () => {
		it("parses StreamDocumentCreatedAction with PDF type", () => {
			const docId = BigInt(100);
			const { view } = createDocumentActionBuffer(docId, DocumentType.PDF, "Test Document", "test.pdf");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CREATED, 100);

			expect(action).to.be.instanceOf(StreamDocumentCreatedAction);
			const docAction = action as StreamDocumentCreatedAction;
			expect(docAction.documentId).to.equal(docId);
			expect(docAction.documentType).to.equal(DocumentType.PDF);
			expect(docAction.documentTitle).to.equal("Test Document");
			expect(docAction.documentFile).to.equal("test.pdf");
		});

		it("parses StreamDocumentCreatedAction with WHITEBOARD type", () => {
			const docId = BigInt(200);
			const { view } = createDocumentActionBuffer(docId, DocumentType.WHITEBOARD, "Whiteboard", "board.wb");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CREATED, 100);

			expect(action).to.be.instanceOf(StreamDocumentCreatedAction);
			const docAction = action as StreamDocumentCreatedAction;
			expect(docAction.documentType).to.equal(DocumentType.WHITEBOARD);
		});

		it("parses StreamDocumentCreatedAction with QUIZ type", () => {
			const docId = BigInt(300);
			const { view } = createDocumentActionBuffer(docId, DocumentType.QUIZ, "Quiz", "quiz.json");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CREATED, 100);

			expect(action).to.be.instanceOf(StreamDocumentCreatedAction);
			const docAction = action as StreamDocumentCreatedAction;
			expect(docAction.documentType).to.equal(DocumentType.QUIZ);
		});

		it("parses StreamDocumentClosedAction", () => {
			const docId = BigInt(400);
			const { view } = createDocumentActionBuffer(docId, DocumentType.PDF, "Closed Doc", "closed.pdf");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CLOSED, 100);

			expect(action).to.be.instanceOf(StreamDocumentClosedAction);
			const docAction = action as StreamDocumentClosedAction;
			expect(docAction.documentId).to.equal(docId);
			expect(docAction.documentTitle).to.equal("Closed Doc");
		});

		it("parses StreamDocumentSelectedAction", () => {
			const docId = BigInt(500);
			const { view } = createDocumentActionBuffer(docId, DocumentType.PDF, "Selected Doc", "selected.pdf");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_SELECTED, 100);

			expect(action).to.be.instanceOf(StreamDocumentSelectedAction);
			const docAction = action as StreamDocumentSelectedAction;
			expect(docAction.documentId).to.equal(docId);
			expect(docAction.documentTitle).to.equal("Selected Doc");
		});

		it("handles empty document title", () => {
			const docId = BigInt(600);
			const { view } = createDocumentActionBuffer(docId, DocumentType.PDF, "", "notitle.pdf");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CREATED, 100);

			expect(action).to.be.instanceOf(StreamDocumentCreatedAction);
			const docAction = action as StreamDocumentCreatedAction;
			expect(docAction.documentTitle).to.equal("");
		});

		it("handles document with checksum", () => {
			const docId = BigInt(700);
			const { view } = createDocumentActionBuffer(docId, DocumentType.PDF, "Doc", "doc.pdf", "abc123checksum");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_DOCUMENT_CREATED, 100);

			expect(action).to.be.instanceOf(StreamDocumentCreatedAction);
		});
	});

	describe("Speech Actions", () => {
		it("parses StreamSpeechPublishedAction", () => {
			const { view } = createSpeechActionBuffer("12345", "John Doe");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_SPEECH_PUBLISHED, 100);

			expect(action).to.be.instanceOf(StreamSpeechPublishedAction);
			const speechAction = action as StreamSpeechPublishedAction;
			expect(speechAction.displayName).to.equal("John Doe");
		});

		it("handles speech action with empty display name", () => {
			const { view } = createSpeechActionBuffer("99999", "");

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_SPEECH_PUBLISHED, 100);

			expect(action).to.be.instanceOf(StreamSpeechPublishedAction);
			const speechAction = action as StreamSpeechPublishedAction;
			expect(speechAction.displayName).to.equal("");
		});
	});

	describe("Playback Actions", () => {
		it("parses StreamPagePlaybackAction with UndoAction", () => {
			const docId = BigInt(1000);
			const pageNumber = 2;
			const { view } = createPlaybackActionBuffer(docId, pageNumber, ActionType.UNDO, 500);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_PAGE_ACTION, 100);

			expect(action).to.be.instanceOf(StreamPagePlaybackAction);
			const playbackAction = action as StreamPagePlaybackAction;
			expect(playbackAction.documentId).to.equal(docId);
			expect(playbackAction.pageNumber).to.equal(pageNumber);
			expect(playbackAction.action).to.be.instanceOf(UndoAction);
			expect(playbackAction.action.timestamp).to.equal(500);
		});

		it("parses StreamPageActionsAction", () => {
			const docId = BigInt(2000);
			const pageNumber = 1;
			const pageTimestamp = 1000;
			const { view } = createPlaybackActionsBuffer(docId, pageNumber, pageTimestamp);

			const action = StreamActionParser.parse(view, StreamActionType.STREAM_PAGE_ACTIONS, 100);

			expect(action).to.be.instanceOf(StreamPageActionsAction);
			const actionsAction = action as StreamPageActionsAction;
			expect(actionsAction.documentId).to.equal(docId);
			expect(actionsAction.recordedPage.pageNumber).to.equal(pageNumber);
			expect(actionsAction.recordedPage.timestamp).to.equal(pageTimestamp);
		});
	});

	describe("Error Handling", () => {
		it("throws error for unknown stream action type", () => {
			const buffer = new ArrayBuffer(0);
			const view = new ProgressiveDataView(buffer);

			expect(() => StreamActionParser.parse(view, 999 as StreamActionType, 0))
				.to.throw("StreamAction not implemented");
		});

		it("throws error for STREAM_CAMERA_CHANGE (not implemented)", () => {
			const buffer = new ArrayBuffer(0);
			const view = new ProgressiveDataView(buffer);

			expect(() => StreamActionParser.parse(view, StreamActionType.STREAM_CAMERA_CHANGE, 0))
				.to.throw("StreamAction not implemented");
		});

		it("throws error for STREAM_MICROPHONE_CHANGE (not implemented)", () => {
			const buffer = new ArrayBuffer(0);
			const view = new ProgressiveDataView(buffer);

			expect(() => StreamActionParser.parse(view, StreamActionType.STREAM_MICROPHONE_CHANGE, 0))
				.to.throw("StreamAction not implemented");
		});

		it("throws error for STREAM_SCREEN_SHARE_CHANGE (not implemented)", () => {
			const buffer = new ArrayBuffer(0);
			const view = new ProgressiveDataView(buffer);

			expect(() => StreamActionParser.parse(view, StreamActionType.STREAM_SCREEN_SHARE_CHANGE, 0))
				.to.throw("StreamAction not implemented");
		});
	});
});

