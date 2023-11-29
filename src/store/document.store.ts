import { makeAutoObservable } from "mobx";
import { CourseStateDocument } from "../model/course-state-document";
import { SlideDocument } from "../model/document";
import { Page } from "../model/page";

export interface DocumentState {
	document: SlideDocument;
	selectedPage: Page,
	selectedPageNumber: number;
}

class DocumentStore {

	documents: SlideDocument[] = [];

	documentStateMap: Map<bigint, DocumentState> | undefined;

	activeDocument: CourseStateDocument | undefined;
	documentMap: Map<bigint, CourseStateDocument> | undefined;

	selectedDocument: SlideDocument | undefined;
	selectedPage: Page | undefined;
	selectedPageNumber: number | undefined;


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

	setActiveDocument(document: CourseStateDocument) {
		this.activeDocument = document;
	}

	setDocumentMap(map: Map<bigint, CourseStateDocument>) {
		this.documentMap = map;
	}

	setSelectedPage(page: Page) {
		this.selectedPage = page;
	}

	setSelectedPageNumber(pageNumber: number) {
		this.selectedPageNumber = pageNumber;
	}

	reset() {
		this.documents = [];
		this.documentStateMap = undefined;
		this.activeDocument = undefined;
		this.documentMap = undefined;

		this.selectedDocument = undefined;
		this.selectedPage = undefined;
		this.selectedPageNumber = undefined;
	}
}

export const documentStore = new DocumentStore();