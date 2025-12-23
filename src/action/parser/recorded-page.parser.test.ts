import { expect } from "@open-wc/testing";
import { RecordedPageParser } from "./recorded-page.parser.js";
import { ProgressiveDataView } from "./progressive-data-view.js";
import { ActionType } from "../action-type.js";
import { RecordedPage } from "../../model/recorded-page.js";
import { UndoAction } from "../undo.action.js";
import { RedoAction } from "../redo.action.js";

/**
 * Creates a buffer for an atomic action (like UNDO/REDO) with timestamp
 * Format: [length(4)] [type(1)] [timestamp(4)] [header(4)] = 13 bytes
 */
function createAtomicActionBuffer(actionType: ActionType, timestamp: number): DataView {
	const buffer = new ArrayBuffer(13);
	const view = new DataView(buffer);

	view.setInt32(0, 9);           // length = type(1) + timestamp(4) + header(4)
	view.setInt8(4, actionType);   // action type
	view.setInt32(5, timestamp);   // timestamp
	view.setInt32(9, 0);           // action header (no key event)

	return view;
}

/**
 * Creates a buffer for a RecordedPage
 * Format: [pageNumber(4)] [timestamp(4)] [staticActionSize(4)] [staticActions...] [playbackActionSize(4)] [playbackActions...]
 */
function createRecordedPageBuffer(
	pageNumber: number,
	pageTimestamp: number,
	staticActions: { type: ActionType, timestamp: number }[],
	playbackActions: { type: ActionType, timestamp: number }[]
): ArrayBuffer {
	const staticActionsSize = staticActions.length * 13;
	const playbackActionsSize = playbackActions.length * 13;

	// 4 (pageNumber) + 4 (timestamp) + 4 (staticActionSize) + staticActionsSize + 4 (playbackActionSize) + playbackActionsSize
	const totalSize = 16 + staticActionsSize + playbackActionsSize;
	const buffer = new ArrayBuffer(totalSize);
	const view = new DataView(buffer);

	let offset = 0;

	view.setInt32(offset, pageNumber); offset += 4;
	view.setInt32(offset, pageTimestamp); offset += 4;
	view.setInt32(offset, staticActionsSize); offset += 4;

	// Write static actions
	for (const action of staticActions) {
		view.setInt32(offset, 9); offset += 4;        // length
		view.setInt8(offset, action.type); offset += 1; // type
		view.setInt32(offset, action.timestamp); offset += 4; // timestamp
		view.setInt32(offset, 0); offset += 4;        // header (no key event)
	}

	view.setInt32(offset, playbackActionsSize); offset += 4;

	// Write playback actions
	for (const action of playbackActions) {
		view.setInt32(offset, 9); offset += 4;        // length
		view.setInt8(offset, action.type); offset += 1; // type
		view.setInt32(offset, action.timestamp); offset += 4; // timestamp
		view.setInt32(offset, 0); offset += 4;        // header (no key event)
	}

	return buffer;
}

/**
 * Creates a buffer for multiple RecordedPages with entry length prefix
 * Format: [entryLength(4)] [recordedPage...] [entryLength(4)] [recordedPage...] ...
 */
function createMultiPageBuffer(pages: Array<{
	pageNumber: number,
	pageTimestamp: number,
	staticActions: { type: ActionType, timestamp: number }[],
	playbackActions: { type: ActionType, timestamp: number }[]
}>): ArrayBuffer {
	// Calculate total size
	let totalSize = 0;
	const pageBuffers: ArrayBuffer[] = [];

	for (const page of pages) {
		const pageBuffer = createRecordedPageBuffer(
			page.pageNumber,
			page.pageTimestamp,
			page.staticActions,
			page.playbackActions
		);
		pageBuffers.push(pageBuffer);
		totalSize += 4 + pageBuffer.byteLength; // 4 for entryLength prefix
	}

	const buffer = new ArrayBuffer(totalSize);
	const view = new DataView(buffer);
	const uint8View = new Uint8Array(buffer);

	let offset = 0;
	for (const pageBuffer of pageBuffers) {
		view.setInt32(offset, pageBuffer.byteLength);
		offset += 4;
		uint8View.set(new Uint8Array(pageBuffer), offset);
		offset += pageBuffer.byteLength;
	}

	return buffer;
}

describe("RecordedPageParser", () => {
	describe("parseBuffer", () => {
		it("throws error for null buffer", () => {
			expect(() => RecordedPageParser.parseBuffer(null as unknown as ArrayBuffer))
				.to.throw("Received empty course document");
		});

		it("throws error for undefined buffer", () => {
			expect(() => RecordedPageParser.parseBuffer(undefined as unknown as ArrayBuffer))
				.to.throw("Received empty course document");
		});

		it("parses empty buffer (no pages)", () => {
			const buffer = new ArrayBuffer(0);
			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.be.an("array").that.is.empty;
		});

		it("parses single page with no actions", () => {
			const buffer = createMultiPageBuffer([{
				pageNumber: 1,
				pageTimestamp: 1000,
				staticActions: [],
				playbackActions: []
			}]);

			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.have.lengthOf(1);
			expect(pages[0].pageNumber).to.equal(1);
			expect(pages[0].timestamp).to.equal(1000);
			expect(pages[0].staticActions).to.be.empty;
			expect(pages[0].playbackActions).to.be.empty;
		});

		it("parses single page with static actions", () => {
			const buffer = createMultiPageBuffer([{
				pageNumber: 2,
				pageTimestamp: 2000,
				staticActions: [
					{ type: ActionType.UNDO, timestamp: 100 },
					{ type: ActionType.REDO, timestamp: 200 }
				],
				playbackActions: []
			}]);

			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.have.lengthOf(1);
			expect(pages[0].pageNumber).to.equal(2);
			expect(pages[0].staticActions).to.have.lengthOf(2);
			expect(pages[0].staticActions[0]).to.be.instanceOf(UndoAction);
			expect(pages[0].staticActions[0].timestamp).to.equal(100);
			expect(pages[0].staticActions[1]).to.be.instanceOf(RedoAction);
			expect(pages[0].staticActions[1].timestamp).to.equal(200);
		});

		it("parses single page with playback actions", () => {
			const buffer = createMultiPageBuffer([{
				pageNumber: 3,
				pageTimestamp: 3000,
				staticActions: [],
				playbackActions: [
					{ type: ActionType.UNDO, timestamp: 300 }
				]
			}]);

			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.have.lengthOf(1);
			expect(pages[0].playbackActions).to.have.lengthOf(1);
			expect(pages[0].playbackActions[0]).to.be.instanceOf(UndoAction);
			expect(pages[0].playbackActions[0].timestamp).to.equal(300);
		});

		it("parses single page with both static and playback actions", () => {
			const buffer = createMultiPageBuffer([{
				pageNumber: 1,
				pageTimestamp: 1000,
				staticActions: [{ type: ActionType.UNDO, timestamp: 100 }],
				playbackActions: [{ type: ActionType.REDO, timestamp: 200 }]
			}]);

			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.have.lengthOf(1);
			expect(pages[0].staticActions).to.have.lengthOf(1);
			expect(pages[0].playbackActions).to.have.lengthOf(1);
		});

		it("parses multiple pages", () => {
			const buffer = createMultiPageBuffer([
				{
					pageNumber: 1,
					pageTimestamp: 1000,
					staticActions: [{ type: ActionType.UNDO, timestamp: 100 }],
					playbackActions: []
				},
				{
					pageNumber: 2,
					pageTimestamp: 2000,
					staticActions: [],
					playbackActions: [{ type: ActionType.REDO, timestamp: 200 }]
				},
				{
					pageNumber: 3,
					pageTimestamp: 3000,
					staticActions: [{ type: ActionType.UNDO, timestamp: 300 }],
					playbackActions: [{ type: ActionType.REDO, timestamp: 400 }]
				}
			]);

			const pages = RecordedPageParser.parseBuffer(buffer);

			expect(pages).to.have.lengthOf(3);
			expect(pages[0].pageNumber).to.equal(1);
			expect(pages[1].pageNumber).to.equal(2);
			expect(pages[2].pageNumber).to.equal(3);
		});
	});

	describe("parse", () => {
		it("parses a single RecordedPage from data view", () => {
			const buffer = createRecordedPageBuffer(
				5,
				5000,
				[{ type: ActionType.UNDO, timestamp: 500 }],
				[{ type: ActionType.REDO, timestamp: 600 }]
			);

			const dataView = new ProgressiveDataView(buffer);
			const recordedPage = RecordedPageParser.parse(dataView);

			expect(recordedPage).to.be.instanceOf(RecordedPage);
			expect(recordedPage.pageNumber).to.equal(5);
			expect(recordedPage.timestamp).to.equal(5000);
			expect(recordedPage.staticActions).to.have.lengthOf(1);
			expect(recordedPage.playbackActions).to.have.lengthOf(1);
		});

		it("handles page with zero static action size", () => {
			const buffer = createRecordedPageBuffer(
				1,
				1000,
				[],
				[{ type: ActionType.UNDO, timestamp: 100 }]
			);

			const dataView = new ProgressiveDataView(buffer);
			const recordedPage = RecordedPageParser.parse(dataView);

			expect(recordedPage.staticActions).to.be.empty;
			expect(recordedPage.playbackActions).to.have.lengthOf(1);
		});

		it("handles page with zero playback action size", () => {
			const buffer = createRecordedPageBuffer(
				1,
				1000,
				[{ type: ActionType.UNDO, timestamp: 100 }],
				[]
			);

			const dataView = new ProgressiveDataView(buffer);
			const recordedPage = RecordedPageParser.parse(dataView);

			expect(recordedPage.staticActions).to.have.lengthOf(1);
			expect(recordedPage.playbackActions).to.be.empty;
		});

		it("handles multiple actions in static actions", () => {
			const buffer = createRecordedPageBuffer(
				1,
				1000,
				[
					{ type: ActionType.UNDO, timestamp: 100 },
					{ type: ActionType.REDO, timestamp: 200 },
					{ type: ActionType.CLEAR_SHAPES, timestamp: 300 }
				],
				[]
			);

			const dataView = new ProgressiveDataView(buffer);
			const recordedPage = RecordedPageParser.parse(dataView);

			expect(recordedPage.staticActions).to.have.lengthOf(3);
			expect(recordedPage.staticActions[0].timestamp).to.equal(100);
			expect(recordedPage.staticActions[1].timestamp).to.equal(200);
			expect(recordedPage.staticActions[2].timestamp).to.equal(300);
		});

		it("handles multiple actions in playback actions", () => {
			const buffer = createRecordedPageBuffer(
				1,
				1000,
				[],
				[
					{ type: ActionType.UNDO, timestamp: 100 },
					{ type: ActionType.REDO, timestamp: 200 }
				]
			);

			const dataView = new ProgressiveDataView(buffer);
			const recordedPage = RecordedPageParser.parse(dataView);

			expect(recordedPage.playbackActions).to.have.lengthOf(2);
		});
	});
});

