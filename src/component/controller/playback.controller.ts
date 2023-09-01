import { StreamActionProcessor } from "../../action/stream-action-processor";
import { CourseStateDocument } from "../../model/course-state-document";
import { SlideDocument } from "../../model/document";
import { PlaybackService } from "../../service/playback.service";
import { ApplicationContext } from "./context";
import { Controller } from "./controller";
import { RootController } from "./root.controller";

export class PlaybackController extends Controller {

	private readonly playbackService: PlaybackService;

	private readonly actionProcessor: StreamActionProcessor;


	constructor(rootController: RootController, context: ApplicationContext) {
		super(rootController, context);

		this.playbackService = new PlaybackService();
		this.playbackService.initialize(this.renderController);

		this.actionProcessor = new StreamActionProcessor(this.playbackService);
		this.actionProcessor.onGetDocument = this.documentController.getDocument;
		this.actionProcessor.onPeerConnected = this.streamController.onPeerConnected.bind(this.streamController);

		this.eventEmitter.addEventListener("action-data", this.onData.bind(this));
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

	private onData(event: CustomEvent) {
		const data: ArrayBuffer | Blob = event.detail;

		this.actionProcessor.processData(data);
	}
}