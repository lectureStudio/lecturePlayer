import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { PlayerView } from "../component/player-view/player-view";
import { CourseState } from "../model/course-state";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";

export class PlaybackService {

	private documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;

	private renderController: RenderController;


	initialize(playerView: PlayerView, courseState: CourseState, documents: SlideDocument[]) {
		this.documents = new Map();

		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);
		});

		// Select active document.
		const activeStateDoc = courseState.activeDocument;
		let activeDoc: SlideDocument = null;

		for (const doc of documents) {
			if (doc.getDocumentId() == activeStateDoc.documentId) {
				activeDoc = doc;
				break;
			}
		}

		this.renderController = new RenderController(playerView.getSlideView());

		const executor = new StreamActionExecutor(this.renderController);
		executor.setDocument(activeDoc);
		executor.setPageNumber(activeStateDoc.activePage.pageNumber);

		this.actionPlayer = new StreamActionPlayer(executor);
		this.actionPlayer.start();
	}

	dispose() {
		if (this.actionPlayer) {
			this.actionPlayer.stop();
		}
		if (this.renderController) {
			this.renderController.dispose();
		}
	}

	addAction(action: Action): void {
		this.actionPlayer.addAction(action);
	}

	addDocument(document: SlideDocument): void {
		this.documents.set(BigInt(document.getDocumentId()), document);
	}

	removeDocument(docId: bigint): void {
		this.documents.delete(BigInt(docId));
	}

	selectDocument(docId: bigint): void {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			this.actionPlayer.setDocument(document);
		}
	}
}