import { StreamActionProcessor } from "../action/stream-action-processor";
import { CourseContext } from "../context/course.context";
import { LpParticipantDataEvent } from "../event";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { PlaybackService } from "../service/playback.service";

export class PlaybackController {

	private readonly playbackService: PlaybackService;

	private readonly actionProcessor: StreamActionProcessor;


	constructor(context: CourseContext) {
		this.playbackService = new PlaybackService();
		this.playbackService.initialize(context.renderController);

		this.actionProcessor = new StreamActionProcessor(this.playbackService);
		this.actionProcessor.onGetDocument = context.documentService.getDocument;
		this.actionProcessor.onPeerConnected = context.streamController.onPeerConnected.bind(context.streamController);

		const eventEmitter = context.applicationContext.eventEmitter;

		eventEmitter.addEventListener("lp-participant-data", this.onData.bind(this));
	}

	start() {
		this.playbackService.start();
	}

	setDocuments(documents: SlideDocument[]) {
		this.playbackService.addDocuments(documents);
	}

	setActiveDocument(activeDoc: CourseStateDocument) {
		if (!activeDoc.activePage) {
			throw new Error("Active document has no active page");
		}

		this.playbackService.setActiveDocument(activeDoc.documentId, activeDoc.activePage.pageNumber);
	}

	setDisconnected() {
		this.playbackService.stop();
	}

	private onData(event: LpParticipantDataEvent) {
		const data = event.detail.data;

		this.actionProcessor.processData(data);
	}
}
