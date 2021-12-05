import { ProgressiveDataView } from "../action/parser/progressive-data-view";
import { RecordedPageParser } from "../action/parser/recorded-page.parser";
import { SimpleActionExecutor } from "../action/simple-action-executor";
import { CourseState } from "../model/course-state";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { RecordedPage } from "../model/recorded-page";
import { WhiteboardDocument } from "../model/whiteboard.document";
import { HttpRequest } from "../utils/http-request";
import { DocumentService } from "./document.service";

export class CourseStateService {

	private readonly apiPath = "/course/state";

	private readonly host: string;


	constructor(host: string) {
		this.host = host;
	}

	getCourseState(courseId: number): Promise<CourseState> {
		return new HttpRequest().get(this.getFullPath("/" + courseId));
	}

	getStateDocument(courseId: number, stateDoc: CourseStateDocument): Promise<SlideDocument> {
		if (stateDoc.documentFile) {
			return new Promise<SlideDocument>((resolve, reject) => {
				new HttpRequest().setResponseType("arraybuffer").get<ArrayBuffer>(stateDoc.documentFile)
					.then((dataBuffer: ArrayBuffer) => {
						if (!dataBuffer) {
							throw new Error("Received empty course document");
						}
	
						const byteBuffer = new Uint8Array(dataBuffer);
						const docService = new DocumentService();
	
						return docService.loadDocument(byteBuffer);
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

		return new Promise<SlideDocument>((resolve, reject) => {
			const slideDoc = new WhiteboardDocument();
			slideDoc.setDocumentId(stateDoc.documentId);

			this.preloadSlideDocument(courseId, stateDoc, slideDoc)
				.then(() => {
					resolve(slideDoc);
				})
				.catch((error: any) => {
					reject(error);
				});
		});
	}

	private getStateDocumentActions(courseId: number, stateDoc: CourseStateDocument): Promise<RecordedPage[]> {
		return new Promise<RecordedPage[]>((resolve, reject) => {
			return new HttpRequest().setResponseType("arraybuffer").get<ArrayBuffer>(this.getFullPath("/" + courseId + "/pages/" + stateDoc.documentId))
				.then((dataBuffer: ArrayBuffer) => {
					if (!dataBuffer) {
						reject("Received empty course document");
						return;
					}

					const dataView = new ProgressiveDataView(dataBuffer);
					const bufferLength = dataBuffer.byteLength;

					const recordedPages: RecordedPage[] = [];

					while (dataView.byteOffset < bufferLength) {
						const entryLength = dataView.getInt32();

						const pageParser = new RecordedPageParser();
						const recordedPage = pageParser.parse(dataView);

						if (recordedPage) {
							recordedPages.push(recordedPage);
						}
					}

					resolve(recordedPages);
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

	private getFullPath(path: string): string {
		return this.host + this.apiPath + path;
	}
}