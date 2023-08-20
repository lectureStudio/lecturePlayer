import { DocumentType } from "../../model/document.type";
import { StreamAction } from "../stream.action";
import { StreamActionType } from "../stream.action-type";
import { StreamDocumentClosedAction } from "../stream.document.closed.action";
import { StreamDocumentCreatedAction } from "../stream.document.created.action";
import { StreamDocumentSelectedAction } from "../stream.document.selected.action";
import { StreamPageCreatedAction } from "../stream.page.created.action";
import { StreamPageDeletedAction } from "../stream.page.deleted.action";
import { StreamPageSelectedAction } from "../stream.page.selected.action";
import { StreamPagePlaybackAction } from "../stream.playback.action";
import { StreamPageActionsAction } from "../stream.playbacks.action";
import { StreamSpeechPublishedAction } from "../stream.speech.published.action";
import { ActionParser } from "./action.parser";
import { ProgressiveDataView } from "./progressive-data-view";
import { RecordedPageParser } from "./recorded-page.parser";

export class StreamActionParser {

	static parse(dataView: ProgressiveDataView, type: StreamActionType, length: number): StreamAction {
		switch (type) {
			case StreamActionType.STREAM_INIT:
				break;
			case StreamActionType.STREAM_PAGE_ACTION:
				return this.playbackAction(dataView);
			case StreamActionType.STREAM_PAGE_ACTIONS:
				return this.playbackActions(dataView);
			case StreamActionType.STREAM_PAGE_CREATED:
				return this.pageAction(dataView, StreamPageCreatedAction);
			case StreamActionType.STREAM_PAGE_DELETED:
				return this.pageAction(dataView, StreamPageDeletedAction);
			case StreamActionType.STREAM_PAGE_SELECTED:
				return this.pageAction(dataView, StreamPageSelectedAction);
			case StreamActionType.STREAM_DOCUMENT_CREATED:
				return this.documentAction(dataView, StreamDocumentCreatedAction);
			case StreamActionType.STREAM_DOCUMENT_CLOSED:
				return this.documentAction(dataView, StreamDocumentClosedAction);
			case StreamActionType.STREAM_DOCUMENT_SELECTED:
				return this.documentAction(dataView, StreamDocumentSelectedAction);
			case StreamActionType.STREAM_SPEECH_PUBLISHED:
				return this.speechAction(dataView, StreamSpeechPublishedAction);

			default:
				throw new Error("StreamAction not implemented");
		}
	}

	private static playbackAction(dataView: ProgressiveDataView): StreamPagePlaybackAction {
		const docId = dataView.getInt64();
		const pageNumber = dataView.getInt32();

		const length = dataView.getInt32();
		const type = dataView.getInt8();
		const timestamp = dataView.getInt32();

		const action = ActionParser.parse(dataView, type, length);
		action.timestamp = timestamp;

		return new StreamPagePlaybackAction(docId, pageNumber, action);
	}

	private static playbackActions(dataView: ProgressiveDataView): StreamPageActionsAction {
		const docId = dataView.getInt64();

		const entryLength = dataView.getInt32();
		const recordedPage = RecordedPageParser.parse(dataView);

		return new StreamPageActionsAction(docId, recordedPage);
	}

	private static pageAction<T>(dataView: ProgressiveDataView, type: { new(documentId: bigint, pageNumber: number): T }): T {
		const docId = dataView.getInt64();
		const pageNumber = dataView.getInt32();

		return new type(docId, pageNumber);
	}

	private static documentAction<T>(dataView: ProgressiveDataView, type: { new(documentId: bigint, documentType: DocumentType, documentTitle: string, documentFile: string): T }): T {
		const docId = dataView.getInt64();
		const docType = dataView.getInt8() as DocumentType;

		const titleLength = dataView.getInt32();
		const nameLength = dataView.getInt32();
		const checksumLength = dataView.getInt32();

		const docTitle = dataView.getString(titleLength);
		const docName = dataView.getString(nameLength);
		const docChecksum = dataView.getString(checksumLength);

		return new type(docId, docType, docTitle, docName);
	}

	private static speechAction<T>(dataView: ProgressiveDataView, type: { new(publisherId: bigint, displayName: string): T }): T {
		const idLength = dataView.getInt32();
		const idStr = dataView.getString(idLength);
		const publisherId = BigInt(idStr);

		const nameLength = dataView.getInt32();
		const nameStr = dataView.getString(nameLength);

		return new type(publisherId, nameStr);
	}
}