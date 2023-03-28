import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";
import $documentStore, { addDocument, removeDocumentById, setDocument, setPage, setPageNumber } from "../model/document-store";

export class PlaybackService {

	private documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;

	private renderController: RenderController;


	initialize(controller: RenderController) {
		this.renderController = controller;
		this.documents = new Map();

		const executor = new StreamActionExecutor(this.renderController);

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

		addDocument(document);
	}

	addDocuments(documents: SlideDocument[]): void {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);

			addDocument(doc);
		});
	}

	removeDocument(docId: bigint): void {
		this.documents.delete(BigInt(docId));

		removeDocumentById(docId);
	}

	getSelectedDocument(): SlideDocument {
		return this.actionPlayer.getDocument();
	}

	selectDocument(docId: bigint): void {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			this.actionPlayer.setDocument(document);

			setDocument(document);
		}
	}

	setActiveDocument(docId: bigint, pageNumber: number): boolean {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			setDocument(document);
			setPage(document.getPage(pageNumber));
			setPageNumber(pageNumber);

			this.actionPlayer.setDocument(document);
			this.actionPlayer.setPageNumber(pageNumber);

			return true;
		}

		return false;
	}

	selectPreviousDocumentPage(): boolean {
		const docState = $documentStore.getState().selectedDocumentState;

		return this.setPageNumber(docState.selectedPageNumber - 1);
	}

	selectNextDocumentPage(): boolean {
		const docState = $documentStore.getState().selectedDocumentState;

		return this.setPageNumber(docState.selectedPageNumber + 1);
	}

	setPageNumber(pageNumber: number) {
		const document = this.getSelectedDocument();

		if (document && pageNumber > -1 && pageNumber < document.getPageCount()) {
			this.actionPlayer.setPageNumber(pageNumber);

			setPage(document.getPage(pageNumber));
			setPageNumber(pageNumber);

			return true;
		}

		return false;
	}
}