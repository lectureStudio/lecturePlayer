import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { MediaPlayer } from "../media/media-player";
import { CourseState } from "../model/course-state";
import { SlideDocument } from "../model/document";
import { PlaybackModel } from "../model/playback-model";
import { RenderController } from "../render/render-controller";
import { SyncState } from "../utils/sync-state";
import { PlayerView } from "../view";

export class PlaybackService {

	private readonly playbackModel: PlaybackModel;

	private readonly documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;


	constructor(playbackModel: PlaybackModel) {
		this.playbackModel = playbackModel;
		this.documents = new Map();
	}

	initialize(playerView: PlayerView, courseState: CourseState, documents: SlideDocument[], startTime: BigInt) {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);
		});

		const startTimeMs = Number(startTime);

		const slideView = playerView.getSlideView();

		const mediaPlayer = new MediaPlayer(playerView.getMediaElement());
		mediaPlayer.muted = this.playbackModel.getMuted();
		mediaPlayer.addTimeListener(() => {
			playerView.setDuration(Date.now() - startTimeMs);
		});

		playerView.setOnMute((mute: boolean) => {
			mediaPlayer.muted = mute;
		});
		playerView.setOnVolume((value: number) => {
			mediaPlayer.muted = false;
			mediaPlayer.volume = value;
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

		const renderController = new RenderController();
		renderController.setActionRenderSurface(slideView.getActionRenderSurface());
		renderController.setSlideRenderSurface(slideView.getSlideRenderSurface());
		renderController.setVolatileRenderSurface(slideView.getVolatileRenderSurface());
		renderController.setTextLayerSurface(slideView.getTextLayerSurface());

		const executor = new StreamActionExecutor(renderController);
		executor.setDocument(activeDoc);
		executor.setPageNumber(activeStateDoc.activePage.pageNumber);

		this.actionPlayer = new StreamActionPlayer(executor, new SyncState(mediaPlayer));
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
			console.log("found document to select", docId)

			this.actionPlayer.setDocument(document);
		}
	}
}