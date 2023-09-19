import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { ContentFocus, setContentFocus } from "../model/presentation-store";
import { PlaybackService } from "../service/playback.service";
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
import * as Y from 'yjs';
import { YMap } from "yjs/dist/src/internals";
import { ydocAction } from "./ydoc.action";
import { course } from "../model/course";
import { ToolBeginAction } from "./tool-begin.action";
import { ToolEndAction } from "./tool-end.action";
import { Utils } from "../utils/utils";

export class StreamActionProcessor {

	private streamActionBuffer: {
		docId: bigint;
		bufferedActions: StreamAction[];
	};

	private readonly playbackService: PlaybackService;

	onGetDocument: (stateDoc: CourseStateDocument) => Promise<SlideDocument>;

	onPeerConnected: (peerId: bigint) => void;


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
		else if (action instanceof StreamPagePlaybackAction && !course.peer2Peer) {
			if (!this.bufferAction(action, action.documentId)) {
				this.playbackService.addAction(action.action);
			}
		}
		else if (action instanceof StreamSpeechPublishedAction) {
			this.onPeerConnected(action.publisherId);
		}

		else if (action instanceof ydocAction && course.peer2Peer){
			//get number of actions for user in YDocAction
			let usrAnnotations = course.YDoc.getMap("annotations").get(action.usr) as Map<number,YMap<any>>;
			let oldSize = 0;
			if(usrAnnotations != undefined) oldSize = usrAnnotations.size;

			//update YDoc in course
			Y.applyUpdate(course.YDoc, action.diff);
			Y.applyUpdate(course.publicYDoc, action.diff);

			//get number of actions for user in YDocAction
			usrAnnotations = course.YDoc.getMap("annotations").get(action.usr) as Map<number,YMap<any>>;
			let newSize = usrAnnotations.size;
			if(newSize > oldSize){
				//get Actions from the Difference
				let Actions = action.diffToActions(newSize-oldSize);

				for(let a of Actions){
					this.playbackService.addAction(a);

					//Display user name
					if(a instanceof ToolBeginAction) document.dispatchEvent(Utils.createEvent("participant-active",action.usr));
					if(a instanceof ToolEndAction) document.dispatchEvent(Utils.createEvent("participant-inactive",action.usr));
				}
			}else{
				if(newSize < oldSize){
					throw new Error("Action(s) removed from users annotation map")
				}
			}
			
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

		setContentFocus(ContentFocus.Document);
	}

	private selectPage(pageNumber: number) {
		const pageAction = new PageAction(pageNumber);
		pageAction.timestamp = 0;

		this.playbackService.addAction(pageAction);
	}
}