import { expect, html, fixture } from "@open-wc/testing";

import type { LecturePlayer } from "../player/player.js";
import "../player/player.js";

import { DocumentController } from "./document.controller.js";
import { RootController } from "./root.controller.js";
import { ApplicationContext } from "./context.js";
import { EventEmitter } from "../../utils/event-emitter.js";
import { ChatService } from "../../service/chat.service.js";
import { ModerationService } from "../../service/moderation.service.js";
import { CourseStateDocument } from "../../model/course-state-document.js";
import { CourseFileApi } from "../../transport/course-file-api.js";
import { CourseStateApi } from "../../transport/course-state-api.js";

describe("DocumentController", () => {
	let documentController: DocumentController;
	let rootController: RootController;
	let context: ApplicationContext;

	// Store original API methods
	let originalDownloadFile: typeof CourseFileApi.downloadFile;
	let originalGetDocumentActions: typeof CourseStateApi.getDocummentActions;
	let originalGetPageActions: typeof CourseStateApi.getPageActions;

	beforeEach(async () => {
		const host: LecturePlayer = await fixture(html`<lecture-player></lecture-player>`);

		context = {
			host,
			eventEmitter: new EventEmitter(),
			chatService: new ChatService(),
			moderationService: new ModerationService()
		};

		rootController = new RootController(context);
		documentController = rootController.documentController;

		// Store originals
		originalDownloadFile = CourseFileApi.downloadFile;
		originalGetDocumentActions = CourseStateApi.getDocummentActions;
		originalGetPageActions = CourseStateApi.getPageActions;
	});

	afterEach(() => {
		// Restore originals
		CourseFileApi.downloadFile = originalDownloadFile;
		CourseStateApi.getDocummentActions = originalGetDocumentActions;
		CourseStateApi.getPageActions = originalGetPageActions;
	});

	describe("constructor", () => {
		it("creates document controller", () => {
			expect(documentController).to.exist;
		});
	});

	describe("getDocument", () => {
		it("rejects when file download fails", async () => {
			CourseFileApi.downloadFile = () => Promise.reject(new Error("Download failed"));

			const stateDoc: CourseStateDocument = {
				documentId: BigInt(1),
				documentFile: "test.pdf",
				activePage: null
			};

			try {
				await documentController.getDocument(stateDoc);
				expect.fail("Should have thrown");
			}
			catch (error: any) {
				expect(error.message).to.equal("Download failed");
			}
		});

		it("rejects when receiving empty document", async () => {
			CourseFileApi.downloadFile = () => Promise.resolve(null as any);

			const stateDoc: CourseStateDocument = {
				documentId: BigInt(1),
				documentFile: "test.pdf",
				activePage: null
			};

			try {
				await documentController.getDocument(stateDoc);
				expect.fail("Should have thrown");
			}
			catch (error: any) {
				expect(error.message).to.equal("Received empty course document");
			}
		});
	});

	describe("getDocuments", () => {
		it("resolves with empty array for empty document map", async () => {
			const documents = await documentController.getDocuments(new Map());
			expect(documents).to.be.an("array").that.is.empty;
		});

		it("resolves with empty array for null document map", async () => {
			const documents = await documentController.getDocuments(null as any);
			expect(documents).to.be.an("array").that.is.empty;
		});
	});

	describe("getPageActions", () => {
		it("rejects when API call fails", async () => {
			CourseStateApi.getPageActions = () => Promise.reject(new Error("API error"));

			try {
				await documentController.getPageActions(1, BigInt(1), 1);
				expect.fail("Should have thrown");
			}
			catch (error: any) {
				expect(error.message).to.equal("API error");
			}
		});

		it("parses page actions from buffer", async () => {
			// Create a valid recorded page buffer
			// Format from RecordedPageParser: pageNumber (4) + staticCount (4) + playbackCount (4)
			// Minimum buffer needs: header (4 bytes for page count) + page data
			const buffer = new ArrayBuffer(20);
			const view = new DataView(buffer);
			view.setInt32(0, 1, false);  // page count
			view.setInt32(4, 1, false);  // pageNumber
			view.setInt32(8, 0, false);  // staticCount
			view.setInt32(12, 0, false); // playbackCount
			// 4 more bytes for potential padding or additional data

			CourseStateApi.getPageActions = () => Promise.resolve(buffer);

			const recordedPage = await documentController.getPageActions(1, BigInt(1), 1);

			expect(recordedPage).to.exist;
			expect(recordedPage.pageNumber).to.equal(1);
		});
	});
});

