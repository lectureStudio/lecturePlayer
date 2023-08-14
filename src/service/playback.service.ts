import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";
import { documentStore } from "../store/document.store";

export class PlaybackService {

	private documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;

	private renderController: RenderController;


	constructor() {
		this.documents = new Map();
	}

	initialize(controller: RenderController) {
		this.renderController = controller;

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

		documentStore.addDocument(document);
	}

	addDocuments(documents: SlideDocument[]): void {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);

			documentStore.addDocument(doc);
		});
	}

	removeDocument(docId: bigint): void {
		this.documents.delete(BigInt(docId));

		documentStore.removeDocumentById(docId);
	}

	getSelectedDocument(): SlideDocument {
		return this.actionPlayer.getDocument();
	}

	selectDocument(docId: bigint): void {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			this.actionPlayer.setDocument(document);

			documentStore.setSelectedDocument(document);
		}
	}

	setActiveDocument(docId: bigint, pageNumber: number): boolean {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			documentStore.setSelectedDocument(document);
			documentStore.setSelectedPage(document.getPage(pageNumber));
			documentStore.setSelectedPageNumber(pageNumber);

			this.actionPlayer.setDocument(document);
			this.actionPlayer.setPageNumber(pageNumber);

			return true;
		}

		return false;
	}

	selectPreviousDocumentPage(): boolean {
		return this.setPageNumber(documentStore.selectedPageNumber - 1);
	}

	selectNextDocumentPage(): boolean {
		return this.setPageNumber(documentStore.selectedPageNumber + 1);
	}

	setPageNumber(pageNumber: number) {
		const document = this.getSelectedDocument();

		if (document && pageNumber > -1 && pageNumber < document.getPageCount()) {
			this.actionPlayer.setPageNumber(pageNumber);

			documentStore.setSelectedPage(document.getPage(pageNumber));
			documentStore.setSelectedPageNumber(pageNumber);

			return true;
		}

		return false;
	}
}