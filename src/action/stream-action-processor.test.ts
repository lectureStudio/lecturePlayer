import { expect } from "@open-wc/testing";
import { StreamActionProcessor } from "./stream-action-processor.js";
import { SlideDocument } from "../model/document.js";
import { StreamActionType } from "./stream.action-type.js";
import { DocumentType } from "../model/document.type.js";
import { Action } from "./action.js";

/**
 * Mock Page for testing
 */
class MockPage {
	pageNumber: number;
	constructor(pageNumber: number) {
		this.pageNumber = pageNumber;
	}
}

/**
 * Mock SlideDocument for testing
 */
class MockSlideDocument extends SlideDocument {
	private mockPages: MockPage[];
	private mockDocId: bigint;

	constructor(docId: bigint, pageCount: number = 3) {
		super();
		this.mockDocId = docId;
		this.mockPages = [];
		for (let i = 0; i < pageCount; i++) {
			this.mockPages.push(new MockPage(i));
		}
		(this as any).pages = this.mockPages;
	}

	override getDocumentId(): bigint {
		return this.mockDocId;
	}

	override getPage(pageNumber: number): any {
		return this.mockPages[pageNumber];
	}

	override getPageCount(): number {
		return this.mockPages.length;
	}
}

/**
 * Mock PlaybackService for testing
 */
class MockPlaybackService {
	calls: { method: string; args: any[] }[] = [];
	documents: Map<bigint, SlideDocument> = new Map();
	selectedDocId: bigint | null = null;
	actions: Action[] = [];

	addDocument(document: SlideDocument): void {
		this.calls.push({ method: "addDocument", args: [document] });
		this.documents.set(document.getDocumentId(), document);
	}

	removeDocument(documentId: bigint): void {
		this.calls.push({ method: "removeDocument", args: [documentId] });
		this.documents.delete(documentId);
	}

	selectDocument(documentId: bigint): void {
		this.calls.push({ method: "selectDocument", args: [documentId] });
		this.selectedDocId = documentId;
	}

	addAction(action: Action): void {
		this.calls.push({ method: "addAction", args: [action] });
		this.actions.push(action);
	}

	hasCall(method: string): boolean {
		return this.calls.some(c => c.method === method);
	}

	getCall(method: string): { method: string; args: any[] } | undefined {
		return this.calls.find(c => c.method === method);
	}

	reset(): void {
		this.calls = [];
		this.documents.clear();
		this.selectedDocId = null;
		this.actions = [];
	}
}

/**
 * Creates a buffer for StreamDocumentCreatedAction
 */
function createDocumentCreatedBuffer(docId: bigint, docType: DocumentType, title: string, fileName: string): ArrayBuffer {
	const encoder = new TextEncoder();
	const titleBytes = encoder.encode(title);
	const fileNameBytes = encoder.encode(fileName);

	// Header: length(4) + type(1) + docId(8) + docType(1) + titleLen(4) + fileNameLen(4) + checksumLen(4) + title + fileName
	const totalSize = 4 + 1 + 8 + 1 + 4 + 4 + 4 + titleBytes.length + fileNameBytes.length;
	const buffer = new ArrayBuffer(totalSize);
	const view = new DataView(buffer);

	let offset = 0;
	view.setInt32(offset, totalSize - 5); offset += 4;
	view.setInt8(offset, StreamActionType.STREAM_DOCUMENT_CREATED); offset += 1;
	view.setBigInt64(offset, docId); offset += 8;
	view.setInt8(offset, docType); offset += 1;
	view.setInt32(offset, titleBytes.length); offset += 4;
	view.setInt32(offset, fileNameBytes.length); offset += 4;
	view.setInt32(offset, 0); offset += 4; // checksum length

	const uint8View = new Uint8Array(buffer);
	uint8View.set(titleBytes, offset); offset += titleBytes.length;
	uint8View.set(fileNameBytes, offset);

	return buffer;
}

/**
 * Creates a buffer for StreamDocumentClosedAction
 */
function createDocumentClosedBuffer(docId: bigint): ArrayBuffer {
	const buffer = new ArrayBuffer(26);
	const view = new DataView(buffer);

	view.setInt32(0, 21);
	view.setInt8(4, StreamActionType.STREAM_DOCUMENT_CLOSED);
	view.setBigInt64(5, docId);
	view.setInt8(13, DocumentType.PDF);
	view.setInt32(14, 0); // title length
	view.setInt32(18, 0); // file name length
	view.setInt32(22, 0); // checksum length

	return buffer;
}

/**
 * Creates a buffer for StreamDocumentSelectedAction
 */
function createDocumentSelectedBuffer(docId: bigint): ArrayBuffer {
	const buffer = new ArrayBuffer(26);
	const view = new DataView(buffer);

	view.setInt32(0, 21);
	view.setInt8(4, StreamActionType.STREAM_DOCUMENT_SELECTED);
	view.setBigInt64(5, docId);
	view.setInt8(13, DocumentType.PDF);
	view.setInt32(14, 0); // title length
	view.setInt32(18, 0); // file name length
	view.setInt32(22, 0); // checksum length

	return buffer;
}

/**
 * Creates a buffer for StreamPageSelectedAction
 */
function createPageSelectedBuffer(docId: bigint, pageNumber: number): ArrayBuffer {
	const buffer = new ArrayBuffer(17);
	const view = new DataView(buffer);

	view.setInt32(0, 12);
	view.setInt8(4, StreamActionType.STREAM_PAGE_SELECTED);
	view.setBigInt64(5, docId);
	view.setInt32(13, pageNumber);

	return buffer;
}

/**
 * Creates a buffer for StreamPageDeletedAction
 */
function createPageDeletedBuffer(docId: bigint, pageNumber: number): ArrayBuffer {
	const buffer = new ArrayBuffer(17);
	const view = new DataView(buffer);

	view.setInt32(0, 12);
	view.setInt8(4, StreamActionType.STREAM_PAGE_DELETED);
	view.setBigInt64(5, docId);
	view.setInt32(13, pageNumber);

	return buffer;
}

/**
 * Creates a buffer for StreamSpeechPublishedAction
 */
function createSpeechPublishedBuffer(publisherId: string, displayName: string): ArrayBuffer {
	const encoder = new TextEncoder();
	const idBytes = encoder.encode(publisherId);
	const nameBytes = encoder.encode(displayName);

	const buffer = new ArrayBuffer(5 + 4 + idBytes.length + 4 + nameBytes.length);
	const view = new DataView(buffer);

	let offset = 0;
	view.setInt32(offset, buffer.byteLength - 5); offset += 4;
	view.setInt8(offset, StreamActionType.STREAM_SPEECH_PUBLISHED); offset += 1;
	view.setInt32(offset, idBytes.length); offset += 4;

	const uint8View = new Uint8Array(buffer);
	uint8View.set(idBytes, offset); offset += idBytes.length;
	view.setInt32(offset, nameBytes.length); offset += 4;
	uint8View.set(nameBytes, offset);

	return buffer;
}

describe("StreamActionProcessor", () => {
	let processor: StreamActionProcessor;
	let mockPlaybackService: MockPlaybackService;

	beforeEach(() => {
		mockPlaybackService = new MockPlaybackService();
		processor = new StreamActionProcessor(mockPlaybackService as any);
	});

	describe("constructor", () => {
		it("creates processor with playback service", () => {
			expect(processor).to.not.be.null;
		});
	});

	describe("processData with ArrayBuffer", () => {
		it("processes StreamDocumentClosedAction", () => {
			const docId = BigInt(123);
			mockPlaybackService.documents.set(docId, new MockSlideDocument(docId));
			const buffer = createDocumentClosedBuffer(docId);

			processor.processData(buffer);

			expect(mockPlaybackService.hasCall("removeDocument")).to.be.true;
		});

		it("processes StreamDocumentSelectedAction", () => {
			const docId = BigInt(456);
			mockPlaybackService.documents.set(docId, new MockSlideDocument(docId));
			const buffer = createDocumentSelectedBuffer(docId);

			processor.processData(buffer);

			expect(mockPlaybackService.hasCall("selectDocument")).to.be.true;
		});

		it("processes StreamPageSelectedAction", () => {
			const docId = BigInt(789);
			mockPlaybackService.documents.set(docId, new MockSlideDocument(docId));
			const buffer = createPageSelectedBuffer(docId, 2);

			processor.processData(buffer);

			expect(mockPlaybackService.hasCall("addAction")).to.be.true;
		});

		it("processes StreamPageDeletedAction", () => {
			const docId = BigInt(101);
			mockPlaybackService.documents.set(docId, new MockSlideDocument(docId));
			const buffer = createPageDeletedBuffer(docId, 1);

			processor.processData(buffer);

			expect(mockPlaybackService.hasCall("addAction")).to.be.true;
		});

		it("processes StreamSpeechPublishedAction", () => {
			let peerConnectedCalled = false;
			let connectedPeerId: bigint | null = null;
			let connectedDisplayName: string | null = null;

			processor.onPeerConnected = (peerId: bigint, displayName: string) => {
				peerConnectedCalled = true;
				connectedPeerId = peerId;
				connectedDisplayName = displayName;
			};

			const buffer = createSpeechPublishedBuffer("12345", "John Doe");

			processor.processData(buffer);

			expect(peerConnectedCalled).to.be.true;
			expect(connectedDisplayName).to.equal("John Doe");
		});
	});

	describe("processData with Blob", () => {
		it("processes Blob data (Firefox compatibility)", async () => {
			const docId = BigInt(200);
			mockPlaybackService.documents.set(docId, new MockSlideDocument(docId));
			const arrayBuffer = createDocumentClosedBuffer(docId);
			const blob = new Blob([arrayBuffer]);

			processor.processData(blob);

			// Wait for async blob processing
			await new Promise(resolve => setTimeout(resolve, 50));

			expect(mockPlaybackService.hasCall("removeDocument")).to.be.true;
		});
	});

	describe("action buffering", () => {
		it("buffers actions while document is being created", async () => {
			const docId = BigInt(300);
			let resolveDocument: ((doc: SlideDocument) => void) | null = null;

			processor.onGetDocument = () => {
				return new Promise<SlideDocument>((resolve) => {
					resolveDocument = resolve;
				});
			};

			// Create document (starts buffering)
			const createBuffer = createDocumentCreatedBuffer(docId, DocumentType.PDF, "Test Doc", "test.pdf");
			processor.processData(createBuffer);

			// Send page selected action while document is still loading
			const pageBuffer = createPageSelectedBuffer(docId, 1);
			processor.processData(pageBuffer);

			// Page action should be buffered, not executed yet
			expect(mockPlaybackService.hasCall("addAction")).to.be.false;

			// Now resolve the document
			const mockDoc = new MockSlideDocument(docId, 5);
			resolveDocument!(mockDoc);

			// Wait for promise resolution
			await new Promise(resolve => setTimeout(resolve, 50));

			// Document should be added
			expect(mockPlaybackService.hasCall("addDocument")).to.be.true;
		});

		it("does not buffer actions for different document", () => {
			const docId1 = BigInt(400);
			const docId2 = BigInt(500);

			processor.onGetDocument = () => {
				return new Promise<SlideDocument>(() => {
					// Never resolves - simulates slow loading
				});
			};

			// Create document 1 (starts buffering for docId1)
			const createBuffer = createDocumentCreatedBuffer(docId1, DocumentType.PDF, "Doc 1", "doc1.pdf");
			processor.processData(createBuffer);

			// Action for document 2 should not be buffered
			mockPlaybackService.documents.set(docId2, new MockSlideDocument(docId2));
			const pageBuffer = createPageSelectedBuffer(docId2, 1);
			processor.processData(pageBuffer);

			// Action for doc2 should be processed immediately
			expect(mockPlaybackService.hasCall("addAction")).to.be.true;
		});
	});

	describe("onGetDocument callback", () => {
		it("calls onGetDocument when document is created", () => {
			let callbackCalled = false;
			let receivedStateDoc: any = null;

			processor.onGetDocument = (stateDoc) => {
				callbackCalled = true;
				receivedStateDoc = stateDoc;
				return Promise.resolve(new MockSlideDocument(BigInt(stateDoc.documentId), 3));
			};

			const buffer = createDocumentCreatedBuffer(BigInt(600), DocumentType.PDF, "Test Title", "test.pdf");
			processor.processData(buffer);

			expect(callbackCalled).to.be.true;
			expect(receivedStateDoc.documentName).to.equal("Test Title");
			expect(receivedStateDoc.documentFile).to.equal("test.pdf");
		});

		it("handles document creation error gracefully", async () => {
			// Suppress expected console.error output
			const originalError = console.error;
			console.error = () => {};

			processor.onGetDocument = () => {
				return Promise.reject(new Error("Failed to load document"));
			};

			const buffer = createDocumentCreatedBuffer(BigInt(700), DocumentType.PDF, "Test", "test.pdf");

			// Should not throw
			processor.processData(buffer);

			await new Promise(resolve => setTimeout(resolve, 50));

			expect(mockPlaybackService.hasCall("addDocument")).to.be.false;

			// Restore console.error
			console.error = originalError;
		});
	});

	describe("onPeerConnected callback", () => {
		it("calls onPeerConnected for speech published action", () => {
			let callbackCalled = false;

			processor.onPeerConnected = () => {
				callbackCalled = true;
			};

			const buffer = createSpeechPublishedBuffer("999", "Speaker");
			processor.processData(buffer);

			expect(callbackCalled).to.be.true;
		});
	});
});

