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
	documentStateMap: Map<bigint, DocumentState>;
}

const removeDocumentFromList = (documents: SlideDocument[], id: bigint): SlideDocument[] =>
	documents.filter((doc) => doc.getDocumentId() !== id);

const addDocumentToList = (documents: SlideDocument[], document: SlideDocument): SlideDocument[] => [
	...documents,
	document,
];

const addDocumentState = (stateMap: Map<bigint, DocumentState>, document: SlideDocument): Map<bigint, DocumentState> =>
	new Map([...stateMap.entries(), [ BigInt(document.getDocumentId()), { document: document, selectedPage: null, selectedPageNumber: 0 } ]]);

const updateDocumentStatePage = (documentState: DocumentState, page: Page): DocumentState => {
	documentState.selectedPage = page;
	return documentState;
};
const updateDocumentStatePageNumber = (documentState: DocumentState, pageNumber: number): DocumentState => {
	documentState.selectedPageNumber = pageNumber;
	return documentState;
};

export const addDocument = createEvent<SlideDocument>();
export const removeDocument = createEvent<SlideDocument>();
export const removeDocumentById = createEvent<bigint>();
export const setPage = createEvent<Page>();
export const setPageNumber = createEvent<number>();
export const setDocument = createEvent<SlideDocument>();

export default createStore<DocumentStore>({
	documents: [],
	selectedDocumentState: null,
	documentStateMap: new Map()
})
	.on(addDocument, (state: DocumentStore, document: SlideDocument) => ({
		...state,
		documents: addDocumentToList(state.documents, document),
		documentStateMap: addDocumentState(state.documentStateMap, document)
	}))
	.on(removeDocument, (state: DocumentStore, document: SlideDocument) => ({
		...state,
		documents: removeDocumentFromList(state.documents, document.getDocumentId()),
	}))
	.on(removeDocumentById, (state: DocumentStore, id: bigint) => ({
		...state,
		documents: removeDocumentFromList(state.documents, id),
	}))
	.on(setDocument, (state: DocumentStore, document: SlideDocument) => ({
		...state,
		selectedDocumentState: state.documentStateMap.get(BigInt(document.getDocumentId()))
	}))
	.on(setPage, (state: DocumentStore, page: Page) => {
		if (page !== state.selectedDocumentState.selectedPage) {
			return {
				...state,
				selectedDocumentState: updateDocumentStatePage(state.selectedDocumentState, page)
			};
		}
		return state;
	})
	.on(setPageNumber, (state: DocumentStore, pageNumber: number) => {
		if (pageNumber !== state.selectedDocumentState.selectedPageNumber) {
			return {
				...state,
				selectedDocumentState: updateDocumentStatePageNumber(state.selectedDocumentState, pageNumber)
			};
		}
		return state;
	});