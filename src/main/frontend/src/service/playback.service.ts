import { Action } from "../action/action";
import { StreamActionExecutor } from "../action/action.executor";
import { StreamActionPlayer } from "../action/stream-action-player";
import { SlideDocument } from "../model/document";
import { RenderController } from "../render/render-controller";
import { course } from '../model/course';
import { ToolController } from "../tool/tool-controller";

export class PlaybackService {

	private documents: Map<bigint, SlideDocument>;

	private actionPlayer: StreamActionPlayer;

	private renderController: RenderController;

	private toolController: ToolController;


	initialize(controller: RenderController, toolController: ToolController) {
		this.renderController = controller;
		this.toolController = toolController;
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
	}

	addDocuments(documents: SlideDocument[]): void {
		documents.forEach((doc: SlideDocument) => {
			this.addDocument(doc);
		});
	}

	removeDocument(docId: bigint): void {
		this.documents.delete(BigInt(docId));
	}

	getSelectedDocument(): SlideDocument {
		return this.actionPlayer.getDocument();
	}

	selectDocument(docId: bigint): void {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			this.actionPlayer.setDocument(document);
			this.toolController.setDocument(document);
		}
	}

	setActiveDocument(docId: bigint, pageNumber: number): boolean {
		const document = this.documents.get(BigInt(docId));

		if (document) {
			this.actionPlayer.setDocument(document);
			this.actionPlayer.setPageNumber(pageNumber);

			this.toolController.setDocument(document);
			this.toolController.setPageNumber(pageNumber);

			course.documentState = {
				currentPage: pageNumber,
				pageCount: document.getPageCount()
			};

			return true;
		}

		return false;
	}

	selectPreviousDocumentPage(): boolean {
		const activeStateDoc = course.activeDocument;

		return this.setPageNumber(activeStateDoc.activePage.pageNumber - 1);
	}

	selectNextDocumentPage(): boolean {
		const activeStateDoc = course.activeDocument;

		return this.setPageNumber(activeStateDoc.activePage.pageNumber + 1);
	}

	setPageNumber(pageNumber: number) {
		const document = this.getSelectedDocument();

		if (document && pageNumber > -1 && pageNumber < document.getPageCount()) {
			this.actionPlayer.setPageNumber(pageNumber);
			this.toolController.setPageNumber(pageNumber);

			const activeStateDoc = course.activeDocument;
			activeStateDoc.activePage.pageNumber = pageNumber;

			course.documentState = {
				currentPage: pageNumber,
				pageCount: document.getPageCount()
			};

			return true;
		}

		return false;
	}
}