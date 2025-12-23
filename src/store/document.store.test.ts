import { expect } from "@open-wc/testing";
import { documentStore } from "./document.store.js";

// Mock SlideDocument for testing
function createMockDocument(id: bigint): any {
	return {
		getDocumentId: () => id,
		title: `Document ${id}`,
	};
}

// Mock Page for testing
function createMockPage(number: number): any {
	return {
		pageNumber: number,
	};
}

describe("DocumentStore", () => {
	beforeEach(() => {
		documentStore.reset();
	});

	afterEach(() => {
		documentStore.reset();
	});

	describe("addDocument", () => {
		it("adds a document", () => {
			documentStore.addDocument(createMockDocument(1n));
			expect(documentStore.documents).to.have.length(1);
		});

		it("adds multiple documents", () => {
			documentStore.addDocument(createMockDocument(1n));
			documentStore.addDocument(createMockDocument(2n));
			expect(documentStore.documents).to.have.length(2);
		});
	});

	describe("removeDocument", () => {
		it("removes a document", () => {
			const doc = createMockDocument(1n);
			documentStore.addDocument(doc);
			documentStore.addDocument(createMockDocument(2n));

			documentStore.removeDocument(doc);

			expect(documentStore.documents).to.have.length(1);
		});
	});

	describe("removeDocumentById", () => {
		it("removes document by ID", () => {
			documentStore.addDocument(createMockDocument(1n));
			documentStore.addDocument(createMockDocument(2n));

			documentStore.removeDocumentById(1n);

			expect(documentStore.documents).to.have.length(1);
			expect(documentStore.documents[0].getDocumentId()).to.equal(2n);
		});
	});

	describe("setDocuments", () => {
		it("replaces all documents", () => {
			documentStore.addDocument(createMockDocument(1n));

			documentStore.setDocuments([
				createMockDocument(2n),
				createMockDocument(3n),
			]);

			expect(documentStore.documents).to.have.length(2);
		});
	});

	describe("setSelectedDocument", () => {
		it("sets selected document", () => {
			const doc = createMockDocument(1n);
			documentStore.setSelectedDocument(doc);
			expect(documentStore.selectedDocument).to.equal(doc);
		});
	});

	describe("setActiveDocument", () => {
		it("sets active document", () => {
			const doc = { documentId: 1n } as any;
			documentStore.setActiveDocument(doc);
			expect(documentStore.activeDocument).to.equal(doc);
		});
	});

	describe("setDocumentMap", () => {
		it("sets document map", () => {
			const map = new Map();
			map.set(1n, { documentId: 1n });
			
			documentStore.setDocumentMap(map);
			
			expect(documentStore.documentMap).to.equal(map);
		});
	});

	describe("setSelectedPage", () => {
		it("sets selected page", () => {
			const page = createMockPage(1);
			documentStore.setSelectedPage(page);
			expect(documentStore.selectedPage).to.equal(page);
		});
	});

	describe("setSelectedPageNumber", () => {
		it("sets selected page number", () => {
			documentStore.setSelectedPageNumber(5);
			expect(documentStore.selectedPageNumber).to.equal(5);
		});
	});

	describe("reset", () => {
		it("resets all fields", () => {
			documentStore.addDocument(createMockDocument(1n));
			documentStore.setSelectedDocument(createMockDocument(2n));
			documentStore.setSelectedPage(createMockPage(1));
			documentStore.setSelectedPageNumber(3);
			documentStore.setActiveDocument({ documentId: 1n } as any);

			documentStore.reset();

			expect(documentStore.documents).to.have.length(0);
			expect(documentStore.selectedDocument).to.be.undefined;
			expect(documentStore.selectedPage).to.be.undefined;
			expect(documentStore.selectedPageNumber).to.be.undefined;
			expect(documentStore.activeDocument).to.be.undefined;
			expect(documentStore.documentMap).to.be.undefined;
		});
	});
});

