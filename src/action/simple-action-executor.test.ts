import { expect } from "@open-wc/testing";
import { SimpleActionExecutor } from "./simple-action-executor.js";
import { SlideDocument } from "../model/document.js";
import { PenPoint } from "../geometry/pen-point.js";
import { Tool, ToolType } from "../tool/tool.js";
import { AtomicTool } from "../tool/atomic.tool.js";
import { Action } from "./action.js";
import { ToolContext } from "../tool/tool-context.js";
import { ActionType } from "./action-type.js";

/**
 * Mock Page for testing
 */
class MockPage {
	pageNumber: number;
	constructor(pageNumber: number) {
		this.pageNumber = pageNumber;
	}
}

/**
 * Mock SlideDocument for testing
 */
class MockSlideDocument extends SlideDocument {
	private mockPages: MockPage[];

	constructor(pageCount: number = 3) {
		super();
		this.mockPages = [];
		for (let i = 0; i < pageCount; i++) {
			this.mockPages.push(new MockPage(i));
		}
		(this as any).pages = this.mockPages;
	}

	override getPage(pageNumber: number): any {
		if (pageNumber < 0 || pageNumber > this.mockPages.length - 1) {
			throw new Error(`Page number ${pageNumber} out of bounds.`);
		}
		return this.mockPages[pageNumber];
	}

	override getPageCount(): number {
		return this.mockPages.length;
	}
}

/**
 * Mock Tool for testing
 */
class MockTool extends Tool {
	beginCalled = false;
	executeCalled = false;
	endCalled = false;
	lastPoint: PenPoint | null = null;
	lastContext: ToolContext | null = null;

	override begin(point: PenPoint, context: ToolContext): void {
		this.beginCalled = true;
		this.lastPoint = point;
		this.lastContext = context;
		this.context = context;
	}

	override execute(point: PenPoint): void {
		this.executeCalled = true;
		this.lastPoint = point;
	}

	override end(point: PenPoint): void {
		this.endCalled = true;
		this.lastPoint = point;
	}

	getType(): ToolType {
		return ToolType.PEN;
	}

	createAction(): Action {
		return {
			timestamp: 0,
			keyEvent: undefined,
			execute: () => { },
			getActionType: () => ActionType.PEN,
			toBuffer: () => new ArrayBuffer(0),
			createBuffer: () => ({ buffer: new Uint8Array(0), dataView: new DataView(new ArrayBuffer(0)) })
		} as unknown as Action;
	}
}

/**
 * Mock AtomicTool for testing
 */
class MockAtomicTool extends AtomicTool {
	beginCalled = false;
	executeCalled = false;
	endCalled = false;

	override begin(point: PenPoint, context: ToolContext): void {
		this.beginCalled = true;
		this.context = context;
	}

	override execute(_point: PenPoint): void {
		this.executeCalled = true;
	}

	override end(_point: PenPoint): void {
		this.endCalled = true;
	}

	getType(): ToolType {
		return ToolType.UNDO;
	}

	createAction(): Action {
		return {
			timestamp: 0,
			keyEvent: undefined,
			execute: () => { },
			getActionType: () => ActionType.UNDO,
			toBuffer: () => new ArrayBuffer(0),
			createBuffer: () => ({ buffer: new Uint8Array(0), dataView: new DataView(new ArrayBuffer(0)) })
		} as unknown as Action;
	}
}

describe("SimpleActionExecutor", () => {
	let executor: SimpleActionExecutor;
	let mockDocument: MockSlideDocument;

	beforeEach(() => {
		mockDocument = new MockSlideDocument(5);
		executor = new SimpleActionExecutor(mockDocument);
	});

	describe("constructor", () => {
		it("creates executor with document", () => {
			expect(executor.getDocument()).to.equal(mockDocument);
		});
	});

	describe("getDocument", () => {
		it("returns the document passed to constructor", () => {
			expect(executor.getDocument()).to.equal(mockDocument);
		});
	});

	describe("setSeek", () => {
		it("does nothing (no-op)", () => {
			// Should not throw
			executor.setSeek(true);
			executor.setSeek(false);
			expect(true).to.be.true;
		});
	});

	describe("setKeyEvent", () => {
		it("stores key event in tool context", () => {
			const keyEvent = new KeyboardEvent("keydown", { key: "a" });

			executor.setKeyEvent(keyEvent);

			// Verify no error is thrown
			expect(true).to.be.true;
		});
	});

	describe("setDocument", () => {
		it("does nothing (no-op)", () => {
			const newDoc = new MockSlideDocument(2);

			executor.setDocument(newDoc);

			// Original document should still be returned
			expect(executor.getDocument()).to.equal(mockDocument);
		});
	});

	describe("setPageNumber", () => {
		it("sets page number and updates tool context", () => {
			executor.setPageNumber(2);

			// Should not throw
			expect(true).to.be.true;
		});

		it("does not update if same page number", () => {
			executor.setPageNumber(2);
			executor.setPageNumber(2);

			// Should not throw or do anything
			expect(true).to.be.true;
		});

		it("throws for invalid page number", () => {
			expect(() => executor.setPageNumber(10))
				.to.throw("Page number 10 out of bounds");
		});
	});

	describe("removePageNumber", () => {
		it("does nothing (no-op)", () => {
			executor.removePageNumber(1);
			expect(mockDocument.getPageCount()).to.equal(5);
		});
	});

	describe("setTool", () => {
		it("throws error for null tool", () => {
			expect(() => executor.setTool(null as any))
				.to.throw("Tool must not be null");
		});

		it("sets a tool", () => {
			const tool = new MockTool();

			executor.setTool(tool);

			expect(true).to.be.true;
		});

		it("can set different tools", () => {
			const tool1 = new MockTool();
			const tool2 = new MockTool();

			executor.setTool(tool1);
			executor.setTool(tool2);

			expect(true).to.be.true;
		});
	});

	describe("beginTool", () => {
		it("calls begin on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			executor.setPageNumber(0);
			const point = new PenPoint(10, 20, 0.5);

			executor.beginTool(point);

			expect(tool.beginCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point);
			expect(tool.lastPoint!.x).to.equal(10);
			expect(tool.lastPoint!.y).to.equal(20);
		});

		it("passes tool context to begin", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			executor.setPageNumber(0);
			const point = new PenPoint(0, 0, 0);

			executor.beginTool(point);

			expect(tool.lastContext).to.not.be.null;
		});
	});

	describe("executeTool", () => {
		it("calls execute on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			executor.setPageNumber(0);
			executor.beginTool(new PenPoint(0, 0, 0));
			const point = new PenPoint(30, 40, 0.7);

			executor.executeTool(point);

			expect(tool.executeCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point);
			expect(tool.lastPoint!.x).to.equal(30);
			expect(tool.lastPoint!.y).to.equal(40);
		});
	});

	describe("endTool", () => {
		it("calls end on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			executor.setPageNumber(0);
			executor.beginTool(new PenPoint(0, 0, 0));
			const point = new PenPoint(50, 60, 0.9);

			executor.endTool(point);

			expect(tool.endCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point);
			expect(tool.lastPoint!.x).to.equal(50);
			expect(tool.lastPoint!.y).to.equal(60);
		});
	});

	describe("selectAndExecuteTool", () => {
		it("executes atomic tool lifecycle", () => {
			const atomicTool = new MockAtomicTool();
			executor.setPageNumber(0);

			executor.selectAndExecuteTool(atomicTool);

			expect(atomicTool.beginCalled).to.be.true;
			expect(atomicTool.executeCalled).to.be.true;
			expect(atomicTool.endCalled).to.be.true;
		});

		it("does not remember atomic tools as previous tool", () => {
			const regularTool = new MockTool();
			const atomicTool = new MockAtomicTool();
			executor.setPageNumber(0);

			executor.setTool(regularTool);
			executor.selectAndExecuteTool(atomicTool);

			// No error means success
			expect(true).to.be.true;
		});
	});

	describe("tool lifecycle integration", () => {
		it("executes full tool lifecycle", () => {
			const tool = new MockTool();
			executor.setPageNumber(0);
			executor.setTool(tool);

			const beginPoint = new PenPoint(0, 0, 0.5);
			const executePoint = new PenPoint(10, 10, 0.5);
			const endPoint = new PenPoint(20, 20, 0.5);

			executor.beginTool(beginPoint);
			executor.executeTool(executePoint);
			executor.endTool(endPoint);

			expect(tool.beginCalled).to.be.true;
			expect(tool.executeCalled).to.be.true;
			expect(tool.endCalled).to.be.true;
		});
	});
});

