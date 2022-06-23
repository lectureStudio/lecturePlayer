import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { WhiteboardDocument } from "../model/whiteboard.document";
import { Action } from "./action";
import { PageAction } from "./page.action";
import { ProgressiveDataView } from "./parser/progressive-data-view";
import { StreamActionParser } from "./parser/stream.action.parser";
import { StreamAction } from "./stream.action";
import { StreamDocumentClosedAction } from "./stream.document.closed.action";
import { StreamDocumentCreatedAction } from "./stream.document.created.action";
import { StreamDocumentSelectedAction } from "./stream.document.selected.action";
import { StreamPageSelectedAction } from "./stream.page.selected.action";
import { StreamPagePlaybackAction } from "./stream.playback.action";
import { StreamSpeechPublishedAction } from "./stream.speech.published.action";

export class StreamActionProcessor {

	private streamActionBuffer: {
		docId: bigint;
		bufferedActions: StreamAction[];
	};

	onAddAction: (action: Action) => void;

	onAddDocument: (doc: SlideDocument) => void;

	onSelectDocument: (docId: bigint) => void;

	onRemoveDocument: (docId: bigint) => void;

	onGetDocument: (stateDoc: CourseStateDocument) => Promise<SlideDocument>;

	onPeerConnected: (peerId: bigint) => void;


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
				this.onSelectDocument(action.documentId);
			}
		}
		else if (action instanceof StreamDocumentCreatedAction) {
			if (action.documentType === 1) {
				const slideDoc = new WhiteboardDocument();
				slideDoc.setDocumentId(action.documentId);

				this.onAddDocument(slideDoc);
			}
			else {
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
						this.onAddDocument(doc);
						this.flushActionBuffer(doc.getDocumentId());
					})
					.catch(error => {
						console.error(error);
					});
			}
		}
		else if (action instanceof StreamDocumentClosedAction) {
			this.onRemoveDocument(action.documentId);
		}
		else if (action instanceof StreamPageSelectedAction) {
			if (!this.bufferAction(action, action.documentId)) {
				const pageAction = new PageAction(action.pageNumber);
				pageAction.timestamp = 0;

				this.onAddAction(pageAction);
			}
		}
		else if (action instanceof StreamPagePlaybackAction) {
			if (!this.bufferAction(action, action.documentId)) {
				this.onAddAction(action.action);
			}
		}
		else if (action instanceof StreamSpeechPublishedAction) {
			this.onPeerConnected(action.publisherId);
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
					this.onSelectDocument(action.documentId);
				}
				else if (action instanceof StreamPageSelectedAction) {
					const pageAction = new PageAction(action.pageNumber);
					pageAction.timestamp = 0;

					this.onAddAction(pageAction);
				}
				else if (action instanceof StreamPagePlaybackAction) {
					this.onAddAction(action.action);
				}
			});
		}

		this.streamActionBuffer = null;
	}
}