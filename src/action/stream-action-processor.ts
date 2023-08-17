import { ContentFocus } from "../model/content";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { PlaybackService } from "../service/playback.service";
import { uiStateStore } from "../store/ui-state.store";
import { PageDeleteAction } from "./page-delete.action";
import { PageAction } from "./page.action";
import { ProgressiveDataView } from "./parser/progressive-data-view";
import { StreamActionParser } from "./parser/stream.action.parser";
import { StreamAction } from "./stream.action";
import { StreamDocumentClosedAction } from "./stream.document.closed.action";
import { StreamDocumentCreatedAction } from "./stream.document.created.action";
import { StreamDocumentSelectedAction } from "./stream.document.selected.action";
import { StreamPageDeletedAction } from "./stream.page.deleted.action";
import { StreamPageSelectedAction } from "./stream.page.selected.action";
import { StreamPagePlaybackAction } from "./stream.playback.action";
import { StreamSpeechPublishedAction } from "./stream.speech.published.action";

export class StreamActionProcessor {

	private streamActionBuffer: {
		docId: bigint;
		bufferedActions: StreamAction[];
	};

	private readonly playbackService: PlaybackService;

	onGetDocument: (stateDoc: CourseStateDocument) => Promise<SlideDocument>;

	onPeerConnected: (peerId: bigint, displayName: string) => void;


	constructor(playbackService: PlaybackService) {
		this.playbackService = playbackService;
	}

	processData(data: ArrayBuffer | Blob) {
		if (data instanceof Blob) {
			// Firefox...
			data.arrayBuffer().then(buffer => {
				this.process(buffer);
			});
		}
		else {
			this.process(data);
		}
	}

	private process(data: ArrayBuffer) {
		const dataView = new ProgressiveDataView(data);
		const length = dataView.getInt32();
		const type = dataView.getInt8();

		const action = StreamActionParser.parse(dataView, type, length);

		if (action instanceof StreamDocumentSelectedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.selectDocument(action.documentId);
			}
		}
		else if (action instanceof StreamDocumentCreatedAction) {
			this.streamActionBuffer = {
				bufferedActions: [],
				docId: BigInt(action.documentId)
			};

			const stateDoc: CourseStateDocument = {
				activePage: null,
				documentFile: action.documentFile,
				documentId: action.documentId,
				documentName: action.documentTitle,
				pages: null,
				type: "pdf"
			};

			this.onGetDocument(stateDoc)
				.then((doc: SlideDocument) => {
					this.playbackService.addDocument(doc);
					this.flushActionBuffer(doc.getDocumentId());
				})
				.catch(error => {
					console.error(error);
				});
		}
		else if (action instanceof StreamDocumentClosedAction) {
			this.playbackService.removeDocument(action.documentId);
		}
		else if (action instanceof StreamPageSelectedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.selectPage(action.pageNumber);
			}
		}
		else if (action instanceof StreamPageDeletedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				const pageAction = new PageDeleteAction(action.pageNumber, action.documentId);
				pageAction.timestamp = 0;

				this.playbackService.addAction(pageAction);
			}
		}
		else if (action instanceof StreamPagePlaybackAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.playbackService.addAction(action.action);
			}
		}
		else if (action instanceof StreamSpeechPublishedAction) {
			this.onPeerConnected(action.publisherId, action.displayName);
		}
	}

	private bufferAction(action: StreamAction, docId: bigint): boolean {
		if (this.streamActionBuffer && this.streamActionBuffer.docId === BigInt(docId)) {
			this.streamActionBuffer.bufferedActions.push(action);
			return true;
		}

		return false;
	}

	private flushActionBuffer(docId: bigint): void {
		if (this.streamActionBuffer && this.streamActionBuffer.docId === BigInt(docId)) {
			this.streamActionBuffer.bufferedActions.forEach(action => {
				if (action instanceof StreamDocumentSelectedAction) {
					this.selectDocument(action.documentId);
				}
				else if (action instanceof StreamPageSelectedAction) {
					this.selectPage(action.pageNumber);
				}
				else if (action instanceof StreamPagePlaybackAction) {
					this.playbackService.addAction(action.action);
				}
			});
		}

		this.streamActionBuffer = null;
	}

	private selectDocument(documentId: bigint) {
		this.playbackService.selectDocument(documentId);

		uiStateStore.setContentFocus(ContentFocus.Document);
	}

	private selectPage(pageNumber: number) {
		const pageAction = new PageAction(pageNumber);
		pageAction.timestamp = 0;

		this.playbackService.addAction(pageAction);
	}
}