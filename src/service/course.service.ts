import { RecordedPageParser } from "../action/parser/recorded-page.parser";
import { SimpleActionExecutor } from "../action/simple-action-executor";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { RecordedPage } from "../model/recorded-page";
import { streamStatsStore } from "../store/stream-stats.store";
import { CourseFileApi } from "../transport/course-file-api";
import { CourseStateApi } from "../transport/course-state-api";
import { DocumentService } from "./document.service";

export class CourseStateService {

	getDocument(courseId: number, stateDoc: CourseStateDocument): Promise<SlideDocument> {
		return new Promise<SlideDocument>((resolve, reject) => {
			CourseFileApi.downloadFile(stateDoc.documentFile)
				.then((dataBuffer: ArrayBuffer) => {
					if (!dataBuffer) {
						throw new Error("Received empty course document");
					}

					this.updateDocumentStats(dataBuffer.byteLength);

					return DocumentService.loadDocument(new Uint8Array(dataBuffer));
				})
				.then((slideDoc: SlideDocument) => {
					slideDoc.setDocumentId(stateDoc.documentId);

					this.preloadSlideDocument(courseId, stateDoc, slideDoc)
						.then(() => {
							resolve(slideDoc);
						})
						.catch((error: any) => {
							reject(error);
						});
				})
				.catch((error: any) => {
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
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	private getStateDocumentActions(courseId: number, stateDoc: CourseStateDocument): Promise<RecordedPage[]> {
		return new Promise<RecordedPage[]>((resolve, reject) => {
			return CourseStateApi.getDocummentActions(courseId, stateDoc.documentId)
				.then((dataBuffer: ArrayBuffer) => {
					resolve(RecordedPageParser.parseBuffer(dataBuffer));
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	private preloadSlideDocument(courseId: number, stateDoc: CourseStateDocument, slideDoc: SlideDocument): Promise<void> {
		return this.getStateDocumentActions(courseId, stateDoc)
			.then((pages: RecordedPage[]) => {
				// Pre-load actions for all pages in the document.
				const executor = new SimpleActionExecutor(slideDoc);

				for (const page of pages) {
					this.loadActions(executor, page);
				}
			});
	}

	private loadActions(executor: SimpleActionExecutor, recPage: RecordedPage): void {
		const actions = recPage.playbackActions;
		let actionCount = actions.length;

		if (actionCount < 1) {
			return;
		}

		// Select the page on which to execute the actions.
		executor.setPageNumber(recPage.pageNumber);

		for (let action of actions) {
			try {
				action.execute(executor);
			}
			catch (e) {
				console.error(e);
			}
		}
	}

	private updateDocumentStats(byteSize: number) {
		let stats = streamStatsStore.documentStats;

		if (!stats) {
			stats = {
				countReceived: 0,
				countSent: 0,
				bytesReceived: 0,
				bytesSent: 0
			};

			streamStatsStore.documentStats = stats;
		}

		stats.countReceived += 1;
		stats.bytesReceived += byteSize;
	}
}