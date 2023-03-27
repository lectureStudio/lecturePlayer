import { createEvent, createStore } from "effector";
import { SlideDocument } from "./document";
import { Page } from "./page";

type DocumentState = {
	document: SlideDocument;
	selectedPage: Page,
	selectedPageNumber: number;
}

type DocumentStore = {
	documents: SlideDocument[];
	selectedDocumentState: DocumentState;
	selectedDocument: SlideDocument;
	selectedPage: Page,
	selectedPageNumber: number;
	documentStateMap: Map<bigint, DocumentState>;
}

const removeDocumentFromList = (documents: SlideDocument[], id: bigint): SlideDocument[] =>
	documents.filter((doc) => doc.getDocumentId() !== id);

const addDocumentToList = (documents: SlideDocument[], document: SlideDocument): SlideDocument[] => [
	...documents,
	document,
];

export const addDocument = createEvent<SlideDocument>();
export const removeDocument = createEvent<SlideDocument>();
export const removeDocumentById = createEvent<bigint>();
export const setPage = createEvent<Page>();
export const setPageNumber = createEvent<number>();
export const setDocument = createEvent<SlideDocument>();
export const setDocumentState = createEvent<DocumentState>();

export default createStore<DocumentStore>({
	documents: [],
	selectedDocumentState: null,
	selectedDocument: null,
	selectedPage: null,
	selectedPageNumber: 0,
	documentStateMap: new Map()
})
	.on(addDocument, (state: DocumentStore, document: SlideDocument) => ({
		...state,
		documents: addDocumentToList(state.documents, document),
	}))
	.on(removeDocument, (state: DocumentStore, document: SlideDocument) => ({
		...state,
		documents: removeDocumentFromList(state.documents, document.getDocumentId()),
	}))
	.on(removeDocumentById, (state: DocumentStore, id: bigint) => ({
		...state,
		documents: removeDocumentFromList(state.documents, id),
	}))
	.on(setDocumentState, (state: DocumentStore, docState: DocumentState) => ({
		...state,
		selectedDocumentState: docState,
	}))
	.on(setDocument, (state: DocumentStore, document: SlideDocument) => {
		if (document !== state.selectedDocument) {
			return {
				...state,
				selectedDocument: document,
				selectedDocumentState: state.documentStateMap.get(document.getDocumentId())
			};
		}
		return state;
	})
	.on(setPage, (state: DocumentStore, page: Page) => {
		if (page !== state.selectedPage) {
			return {
				...state,
				selectedPage: page,
				selectedDocumentState: {
					...state.selectedDocumentState,
					selectedPage: page
				}
			};
		}
		return state;
	})
	.on(setPageNumber, (state: DocumentStore, pageNumber: number) => {
		if (pageNumber !== state.selectedPageNumber) {
			return {
				...state,
				selectedPageNumber: pageNumber,
				selectedDocumentState: {
					...state.selectedDocumentState,
					selectedPageNumber: pageNumber
				}
			};
		}
		return state;
	});