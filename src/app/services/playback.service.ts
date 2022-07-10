import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { MediaPlayer } from "../media/media-player";
import { CourseState } from "../model/course-state";
import { SlideDocument } from "../model/document";
import { PlaybackModel } from "../model/playback-model";
import { RenderController } from "../render/render-controller";
import { SyncState } from "../utils/sync-state";
import {Injectable} from "@angular/core";

@Injectable({
	providedIn: 'root'
})
export class PlaybackService {

	private readonly playbackModel: PlaybackModel;

	private readonly documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;


	constructor(playbackModel: PlaybackModel) {
		this.playbackModel = playbackModel;
		this.documents = new Map();
	}

	initialize(courseState: CourseState, documents: SlideDocument[], startTime: BigInt) {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);
		});

		const startTimeMs = Number(startTime);

		// const slideView = playerView.getSlideView();

		// const mediaPlayer = new MediaPlayer(playerView.getMediaElement());
		// mediaPlayer.muted = this.playbackModel.getMuted();
		// mediaPlayer.addTimeListener(() => {
		//
		// });

		// Select active document.
		const activeStateDoc = courseState.avtiveDocument;
		let activeDoc: SlideDocument | null = null;

		for (const doc of documents) {
			if (doc.getDocumentId() == activeStateDoc.documentId) {
				activeDoc = doc;
				break;
			}
		}

		const renderController = new RenderController();
		// enderController.setActionRenderSurface(slideView.getActionRenderSurface());
		// renderController.setSlideRenderSurface(slideView.getSlideRenderSurface());
		// renderController.setVolatileRenderSurface(slideView.getVolatileRenderSurface());
		// renderController.setTextLayerSurface(slideView.getTextLayerSurface());

		const executor = new StreamActionExecutor(renderController);
		if (activeDoc) {
			executor.setDocument(activeDoc);
		}
		if (activeStateDoc.activePage) {
			executor.setPageNumber(activeStateDoc.activePage.pageNumber);
		}

		// this.actionPlayer = new StreamActionPlayer(executor, new SyncState(mediaPlayer));
		// this.actionPlayer.start();
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