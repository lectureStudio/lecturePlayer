import { makeAutoObservable } from "mobx";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { Page } from "../model/page";

export type DocumentState = {
	document: SlideDocument;
	selectedPage: Page,
	selectedPageNumber: number;
}

class DocumentStore {

	documents: SlideDocument[] = [];

	documentStateMap: Map<bigint, DocumentState>;

	activeDocument: CourseStateDocument;
	documentMap: Map<bigint, CourseStateDocument>;

	selectedDocument: SlideDocument;
	selectedPage: Page;
	selectedPageNumber: number;


	constructor() {
		makeAutoObservable(this);
	}

	addDocument(document: SlideDocument) {
		this.documents = [...this.documents, document];
	}

	removeDocument(document: SlideDocument) {
		this.removeDocumentById(document.getDocumentId());
	}

	removeDocumentById(docId: bigint) {
		this.documents = this.documents.filter((d) => d.getDocumentId() !== docId);
	}

	setDocuments(documents: SlideDocument[]) {
		this.documents = documents;
	}

	setSelectedDocument(document: SlideDocument) {
		this.selectedDocument = document;
	}

	setSelectedPage(page: Page) {
		this.selectedPage = page;
	}

	setSelectedPageNumber(pageNumber: number) {
		this.selectedPageNumber = pageNumber;
	}

	reset() {
		this.documents = [];
		this.documentStateMap = null;
		this.activeDocument = null;
		this.documentMap = null;

		this.selectedDocument = null;
		this.selectedPage = null;
		this.selectedPageNumber = null;
	}
}

export const documentStore = new DocumentStore();