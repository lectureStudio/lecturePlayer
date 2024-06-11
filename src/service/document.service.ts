import * as pdfjs from "pdfjs-dist";
import { PDFDocumentProxy } from "pdfjs-dist";
import { RecordedPageParser } from "../action/parser/recorded-page.parser";
import { SimpleActionExecutor } from "../action/simple-action-executor";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { PdfJsDocument } from "../model/pdf-js-document";
import { RecordedPage } from "../model/recorded-page";
import { courseStore } from "../store/course.store";
import { streamStatsStore } from "../store/stream-stats.store";
import { CourseFileApi } from "../transport/course-file-api";
import { CourseStateApi } from "../transport/course-state-api";

export class DocumentService {

	getDocument(stateDoc: CourseStateDocument): Promise<SlideDocument> {
		return new Promise<SlideDocument>((resolve, reject) => {
			CourseFileApi.downloadFile(stateDoc.documentFile)
				.then((dataBuffer: ArrayBuffer) => {
					if (!dataBuffer) {
						throw new Error("Received empty course document");
					}

					DocumentService.updateDocumentStats(dataBuffer.byteLength);

					return DocumentService.loadDocument(new Uint8Array(dataBuffer));
				})
				.then((slideDoc: SlideDocument) => {
					slideDoc.setDocumentId(stateDoc.documentId);

					DocumentService.preloadSlideDocument(courseStore.courseId, stateDoc, slideDoc)
						.then(() => {
							resolve(slideDoc);
						})
						.catch((error: unknown) => {
							reject(error);
						});
				})
				.catch((error: unknown) => {
					reject(error);
				});
		});
	}

	getDocuments(documentMap: Map<bigint, CourseStateDocument>): Promise<SlideDocument[]> {
		return new Promise<SlideDocument[]>((resolve, reject) => {
			// Load all initially opened documents.
			const promises = [];

			for (const value of Object.values(documentMap || {})) {
				const promise = this.getDocument(value);

				promises.push(promise);
			}

			Promise.all(promises)
				.then(documents => {
					resolve(documents);
				})
				.catch(error => {
					reject(error);
				});
		});
	}

	getPageActions(courseId: number, documentId: bigint, pageNumber: number): Promise<RecordedPage> {
		return new Promise<RecordedPage>((resolve, reject) => {
			return CourseStateApi.getPageActions(courseId, documentId, pageNumber)
				.then((dataBuffer: ArrayBuffer) => {
					const recordedPage = RecordedPageParser.parseBuffer(dataBuffer)[0];

					resolve(recordedPage);
				})
				.catch((error: unknown) => {
					reject(error);
				});
		});
	}

	private static loadDocument(source: Uint8Array): Promise<SlideDocument> {
		return new Promise<PdfJsDocument>((resolve, reject) => {
			const loadingTask = pdfjs.getDocument(source);
			loadingTask.promise
				.then(async (pdf: PDFDocumentProxy) => {
					resolve(await PdfJsDocument.create(pdf));
				})
				.catch((reason: string) => {
					reject(reason);
				});
		});
	}

	private static getStateDocumentActions(courseId: number, stateDoc: CourseStateDocument): Promise<RecordedPage[]> {
		return new Promise<RecordedPage[]>((resolve, reject) => {
			return CourseStateApi.getDocummentActions(courseId, stateDoc.documentId)
				.then((dataBuffer: ArrayBuffer) => {
					resolve(RecordedPageParser.parseBuffer(dataBuffer));
				})
				.catch((error: unknown) => {
					reject(error);
				});
		});
	}

	private static preloadSlideDocument(courseId: number, stateDoc: CourseStateDocument, slideDoc: SlideDocument): Promise<void> {
		return this.getStateDocumentActions(courseId, stateDoc)
			.then((pages: RecordedPage[]) => {
				// Preload actions for all pages in the document.
				const executor = new SimpleActionExecutor(slideDoc);

				for (const page of pages) {
					this.loadActions(executor, page);
				}
			});
	}

	private static loadActions(executor: SimpleActionExecutor, recPage: RecordedPage): void {
		const actions = recPage.playbackActions;
		const actionCount = actions.length;

		if (actionCount < 1) {
			return;
		}

		// Select the page on which to execute the actions.
		executor.setPageNumber(recPage.pageNumber);

		for (const action of actions) {
			try {
				action.execute(executor);
			}
			catch (e) {
				console.error(e);
			}
		}
	}

	private static updateDocumentStats(byteSize: number) {
		const stats = streamStatsStore.documentStats;

		if (!stats.countReceived) {
			stats.countReceived = 0;
		}
		if (!stats.bytesReceived) {
			stats.bytesReceived = 0;
		}

		stats.countReceived += 1;
		stats.bytesReceived += byteSize;
	}
}
