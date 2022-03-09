import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { PlayerView } from "../component/player-view/player-view";
import { CourseState } from "../model/course-state";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";

export class PlaybackService {

	private readonly documents: Map<bigint, SlideDocument> = new Map();

	private actionPlayer: StreamActionPlayer;


	initialize(playerView: PlayerView, courseState: CourseState, documents: SlideDocument[]) {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);
		});

		// Select active document.
		const activeStateDoc = courseState.avtiveDocument;
		let activeDoc: SlideDocument = null;

		for (const doc of documents) {
			if (doc.getDocumentId() == activeStateDoc.documentId) {
				activeDoc = doc;
				break;
			}
		}

		const slideView = playerView.getSlideView();

		const renderController = new RenderController();
		renderController.setActionRenderSurface(slideView.getActionRenderSurface());
		renderController.setSlideRenderSurface(slideView.getSlideRenderSurface());
		renderController.setVolatileRenderSurface(slideView.getVolatileRenderSurface());
		renderController.setTextLayerSurface(slideView.getTextLayerSurface());

		const executor = new StreamActionExecutor(renderController);
		executor.setDocument(activeDoc);
		executor.setPageNumber(activeStateDoc.activePage.pageNumber);

		this.actionPlayer = new StreamActionPlayer(executor);
		this.actionPlayer.start();
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