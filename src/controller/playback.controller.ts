import { StreamActionProcessor } from "../action/stream-action-processor";
import { CourseContext } from "../context/course.context";
import { LpParticipantDataEvent } from "../event";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { PlaybackService } from "../service/playback.service";
import { EventEmitter } from "../utils/event-emitter";
import { Controller } from "./controller";
import { StreamController } from "./stream.controller";

export class PlaybackController extends Controller {

	private readonly playbackService: PlaybackService;

	private readonly actionProcessor: StreamActionProcessor;


	constructor(context: CourseContext, streamController: StreamController) {
		super(context.applicationContext);

		this.playbackService = new PlaybackService();
		this.playbackService.initialize(context.renderController);

		this.actionProcessor = new StreamActionProcessor(this.playbackService);
		this.actionProcessor.onGetDocument = context.documentService.getDocument;
		this.actionProcessor.onPeerConnected = streamController.onPeerConnected.bind(streamController);
	}

	protected override initializeEvents(eventEmitter: EventEmitter) {
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

	public override dispose(): void {
		super.dispose();

		this.setDisconnected();
	}

	private onData(event: LpParticipantDataEvent) {
		const data = event.detail.data;

		this.actionProcessor.processData(data);
	}
}
