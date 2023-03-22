import { createEvent, createStore } from "effector";
import { SlideDocument } from "./document";
import { Page } from "./page";

type DocumentStore = {
	selectedDocument: SlideDocument;
	selectedPage: Page,
	selectedPageNumber: number;
}

export const setPage = createEvent<Page>();
export const setPageNumber = createEvent<number>();
export const setDocument = createEvent<SlideDocument>();

export default createStore<DocumentStore>({
	selectedDocument: null,
	selectedPage: null,
	selectedPageNumber: 0,
})
	.on(setDocument, (state: DocumentStore, document: SlideDocument) => {
		if (document !== state.selectedDocument) {
			return {
				...state,
				selectedDocument: document,
			};
		}
		return state;
	})
	.on(setPage, (state: DocumentStore, page: Page) => {
		if (page !== state.selectedPage) {
			return {
				...state,
				selectedPage: page,
			};
		}
		return state;
	})
	.on(setPageNumber, (state: DocumentStore, pageNumber: number) => {
		if (pageNumber !== state.selectedPageNumber) {
			return {
				...state,
				selectedPageNumber: pageNumber,
			};
		}
		return state;
	});