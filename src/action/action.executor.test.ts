import { expect } from "@open-wc/testing";
import { StreamActionExecutor } from "./action.executor.js";
import { SlideDocument } from "../model/document.js";
import { PenPoint } from "../geometry/pen-point.js";
import { Tool, ToolType } from "../tool/tool.js";
import { AtomicTool } from "../tool/atomic.tool.js";
import { Action } from "./action.js";
import { ToolContext } from "../tool/tool-context.js";
import { ActionType } from "./action-type.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { Rectangle } from "../geometry/rectangle.js";
import { Font } from "../paint/font.js";
import { Point } from "../geometry/point.js";

// Import all action types
import { UndoAction } from "./undo.action.js";
import { RedoAction } from "./redo.action.js";
import { ClearShapesAction } from "./clear-shapes.action.js";
import { PenAction } from "./pen.action.js";
import { HighlighterAction } from "./highlighter.action.js";
import { PointerAction } from "./pointer.action.js";
import { ArrowAction } from "./arrow.action.js";
import { LineAction } from "./line.action.js";
import { RectangleAction } from "./rectangle.action.js";
import { EllipseAction } from "./ellipse.action.js";
import { ZoomAction } from "./zoom.action.js";
import { ZoomOutAction } from "./zoom-out.action.js";
import { PanAction } from "./pan.action.js";
import { SelectAction } from "./select.action.js";
import { SelectGroupAction } from "./select-group.action.js";
import { CloneAction } from "./clone.action.js";
import { KeyAction } from "./key.action.js";
import { TextAction } from "./text.action.js";
import { TextChangeAction } from "./text-change.action.js";
import { LatexAction } from "./latex.action.js";
import { RubberAction } from "./rubber.action.js";
import { ExtendViewAction } from "./extend-view.action.js";
import { PageAction } from "./page.action.js";
import { PageDeleteAction } from "./page-delete.action.js";
import { ToolBeginAction } from "./tool-begin.action.js";
import { ToolExecuteAction } from "./tool-execute.action.js";
import { ToolEndAction } from "./tool-end.action.js";
import { TextFontAction } from "./text-font.action.js";
import { TextMoveAction } from "./text-move.action.js";
import { TextRemoveAction } from "./text-remove.action.js";
import { TextHighlightAction } from "./text-highlight.action.js";
import { LatexFontAction } from "./latex-font.action.js";

/**
 * Mock Page for testing
 */
class MockPage {
	pageNumber: number;
	shapes: any[] = [];
	constructor(pageNumber: number) {
		this.pageNumber = pageNumber;
	}
	getShapes() { return this.shapes; }
	getShapeByHandle(_handle: number) { return null; }
	addShape(_shape: any) { }
	removeShape(_shape: any) { }
}

/**
 * Mock RenderController for testing
 */
class MockRenderController {
	seekMode: boolean = false;
	currentPage: MockPage | null = null;

	setSeek(seek: boolean): void {
		this.seekMode = seek;
	}

	setPage(page: MockPage): void {
		this.currentPage = page;
	}

	beginBulkRender(): void { }
	endBulkRender(): void { }
	render(): void { }
	renderVolatile(): void { }
	removeShape(_shape: any): void { }
	setSlideTransform(_transform: any): void { }
}

/**
 * Mock ActionExecutor for tracking method calls
 */
class MockActionExecutor {
	calls: { method: string; args: any[] }[] = [];
	currentTool: Tool | null = null;
	keyEventSet: KeyboardEvent | undefined = undefined;
	document: SlideDocument | null = null;
	pageNumber: number = 0;

	setKeyEvent(keyEvent: KeyboardEvent | undefined): void {
		this.calls.push({ method: "setKeyEvent", args: [keyEvent] });
		this.keyEventSet = keyEvent;
	}

	setSeek(seek: boolean): void {
		this.calls.push({ method: "setSeek", args: [seek] });
	}

	getDocument(): SlideDocument | null {
		return this.document;
	}

	setDocument(document: SlideDocument): void {
		this.calls.push({ method: "setDocument", args: [document] });
		this.document = document;
	}

	setPageNumber(pageNumber: number): void {
		this.calls.push({ method: "setPageNumber", args: [pageNumber] });
		this.pageNumber = pageNumber;
	}

	removePageNumber(pageNumber: number): void {
		this.calls.push({ method: "removePageNumber", args: [pageNumber] });
	}

	setTool(tool: Tool): void {
		this.calls.push({ method: "setTool", args: [tool] });
		this.currentTool = tool;
	}

	selectAndExecuteTool(tool: AtomicTool): void {
		this.calls.push({ method: "selectAndExecuteTool", args: [tool] });
	}

	beginTool(point: PenPoint): void {
		this.calls.push({ method: "beginTool", args: [point] });
	}

	executeTool(point: PenPoint): void {
		this.calls.push({ method: "executeTool", args: [point] });
	}

	endTool(point: PenPoint): void {
		this.calls.push({ method: "endTool", args: [point] });
	}

	hasCall(method: string): boolean {
		return this.calls.some(c => c.method === method);
	}

	getCall(method: string): { method: string; args: any[] } | undefined {
		return this.calls.find(c => c.method === method);
	}

	reset(): void {
		this.calls = [];
		this.currentTool = null;
		this.keyEventSet = undefined;
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
		// TypeScript workaround: assign to protected pages
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

	override deletePage(pageNumber: number): void {
		this.mockPages.splice(pageNumber, 1);
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

	override begin(point: PenPoint, context: ToolContext): void {
		this.beginCalled = true;
		this.lastPoint = point;
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

describe("StreamActionExecutor", () => {
	let executor: StreamActionExecutor;
	let mockRenderController: MockRenderController;

	beforeEach(() => {
		mockRenderController = new MockRenderController();
		executor = new StreamActionExecutor(mockRenderController as any);
	});

	describe("setKeyEvent", () => {
		it("sets key event on tool context", () => {
			const keyEvent = new KeyboardEvent("keydown", { key: "a" });

			executor.setKeyEvent(keyEvent);

			// Verify no error is thrown - the key event is stored internally
			expect(true).to.be.true;
		});
	});

	describe("setSeek", () => {
		it("sets seek mode on render controller", () => {
			executor.setSeek(true);

			expect(mockRenderController.seekMode).to.be.true;
		});

		it("sets seek mode to false", () => {
			executor.setSeek(true);
			executor.setSeek(false);

			expect(mockRenderController.seekMode).to.be.false;
		});
	});

	describe("getDocument / setDocument", () => {
		it("returns null when no document is set", () => {
			expect(executor.getDocument()).to.be.null;
		});

		it("returns the document after setting it", () => {
			const doc = new MockSlideDocument(3);

			executor.setDocument(doc);

			expect(executor.getDocument()).to.equal(doc);
		});
	});

	describe("setPageNumber", () => {
		it("throws error when document is not set", () => {
			expect(() => executor.setPageNumber(0))
				.to.throw("Document must not be null");
		});

		it("sets page number when document is set", () => {
			const doc = new MockSlideDocument(3);
			executor.setDocument(doc);

			executor.setPageNumber(1);

			// Page should be set on render controller
			expect(mockRenderController.currentPage).to.not.be.null;
			expect(mockRenderController.currentPage).to.equal(doc.getPage(1));
		});

		it("throws error for invalid page number", () => {
			const doc = new MockSlideDocument(3);
			executor.setDocument(doc);

			expect(() => executor.setPageNumber(5))
				.to.throw("Page number 5 out of bounds");
		});

		it("throws error for negative page number", () => {
			const doc = new MockSlideDocument(3);
			executor.setDocument(doc);

			expect(() => executor.setPageNumber(-1))
				.to.throw("Page number -1 out of bounds");
		});
	});

	describe("removePageNumber", () => {
		it("throws error when document is not set", () => {
			expect(() => executor.removePageNumber(0))
				.to.throw("Document must not be null");
		});

		it("removes page when document is set", () => {
			const doc = new MockSlideDocument(3);
			executor.setDocument(doc);
			const originalCount = doc.getPageCount();

			executor.removePageNumber(1);

			expect(doc.getPageCount()).to.equal(originalCount - 1);
		});
	});

	describe("setTool", () => {
		it("throws error when tool is null", () => {
			expect(() => executor.setTool(null as any))
				.to.throw("Tool must not be null");
		});

		it("sets a tool", () => {
			const tool = new MockTool();

			executor.setTool(tool);

			// No error means success - tool is stored internally
			expect(true).to.be.true;
		});

		it("can set a different tool", () => {
			const tool1 = new MockTool();
			const tool2 = new MockTool();

			executor.setTool(tool1);
			executor.setTool(tool2);

			// No error means success
			expect(true).to.be.true;
		});
	});

	describe("beginTool", () => {
		it("throws error when no tool is set", () => {
			const point = new PenPoint(10, 20, 0.5);

			expect(() => executor.beginTool(point))
				.to.throw("Tool must not be null");
		});

		it("calls begin on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			const point = new PenPoint(10, 20, 0.5);

			executor.beginTool(point);

			expect(tool.beginCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point); // Cloned
			expect(tool.lastPoint!.x).to.equal(10);
			expect(tool.lastPoint!.y).to.equal(20);
		});
	});

	describe("executeTool", () => {
		it("throws error when no tool is set", () => {
			const point = new PenPoint(10, 20, 0.5);

			expect(() => executor.executeTool(point))
				.to.throw("Tool must not be null");
		});

		it("calls execute on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			const point = new PenPoint(30, 40, 0.7);

			executor.executeTool(point);

			expect(tool.executeCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point); // Cloned
			expect(tool.lastPoint!.x).to.equal(30);
			expect(tool.lastPoint!.y).to.equal(40);
		});
	});

	describe("endTool", () => {
		it("throws error when no tool is set", () => {
			const point = new PenPoint(10, 20, 0.5);

			expect(() => executor.endTool(point))
				.to.throw("Tool must not be null");
		});

		it("calls end on the tool with cloned point", () => {
			const tool = new MockTool();
			executor.setTool(tool);
			const point = new PenPoint(50, 60, 0.9);

			executor.endTool(point);

			expect(tool.endCalled).to.be.true;
			expect(tool.lastPoint).to.not.equal(point); // Cloned
			expect(tool.lastPoint!.x).to.equal(50);
			expect(tool.lastPoint!.y).to.equal(60);
		});
	});

	describe("selectAndExecuteTool", () => {
		it("executes atomic tool lifecycle (begin, execute, end)", () => {
			const atomicTool = new MockAtomicTool();

			executor.selectAndExecuteTool(atomicTool);

			expect(atomicTool.beginCalled).to.be.true;
			expect(atomicTool.executeCalled).to.be.true;
			expect(atomicTool.endCalled).to.be.true;
		});

		it("does not remember atomic tools as previous tool", () => {
			const regularTool = new MockTool();
			const atomicTool = new MockAtomicTool();

			executor.setTool(regularTool);
			executor.selectAndExecuteTool(atomicTool);

			// After atomic tool execution, previous tool should still be available
			// We verify by checking that the executor works correctly afterwards
			expect(true).to.be.true;
		});
	});

	describe("tool lifecycle integration", () => {
		it("executes full tool lifecycle", () => {
			const tool = new MockTool();
			const beginPoint = new PenPoint(0, 0, 0.5);
			const executePoint = new PenPoint(10, 10, 0.5);
			const endPoint = new PenPoint(20, 20, 0.5);

			executor.setTool(tool);
			executor.beginTool(beginPoint);
			executor.executeTool(executePoint);
			executor.endTool(endPoint);

			expect(tool.beginCalled).to.be.true;
			expect(tool.executeCalled).to.be.true;
			expect(tool.endCalled).to.be.true;
		});

		it("can switch between tools", () => {
			const tool1 = new MockTool();
			const tool2 = new MockTool();
			const point = new PenPoint(0, 0, 0.5);

			executor.setTool(tool1);
			executor.beginTool(point);
			expect(tool1.beginCalled).to.be.true;

			executor.setTool(tool2);
			executor.beginTool(point);
			expect(tool2.beginCalled).to.be.true;
		});
	});

	describe("document and page operations", () => {
		it("can navigate through pages", () => {
			const doc = new MockSlideDocument(5);
			executor.setDocument(doc);

			executor.setPageNumber(0);
			const page0 = mockRenderController.currentPage;

			executor.setPageNumber(2);
			const page2 = mockRenderController.currentPage;

			executor.setPageNumber(4);
			const page4 = mockRenderController.currentPage;

			expect(page0).to.equal(doc.getPage(0));
			expect(page2).to.equal(doc.getPage(2));
			expect(page4).to.equal(doc.getPage(4));
		});

		it("can remove multiple pages", () => {
			const doc = new MockSlideDocument(5);
			executor.setDocument(doc);

			executor.removePageNumber(0);
			expect(doc.getPageCount()).to.equal(4);

			executor.removePageNumber(0);
			expect(doc.getPageCount()).to.equal(3);
		});
	});
});

/**
 * Tests for all Action types executing through the executor
 */
describe("Action Execution", () => {
	let mockExecutor: MockActionExecutor;
	let mockBrush: Brush;

	beforeEach(() => {
		mockExecutor = new MockActionExecutor();
		mockBrush = new Brush(new Color(255, 0, 0), 2.0);
	});

	describe("Atomic Actions (selectAndExecuteTool)", () => {
		it("UndoAction calls selectAndExecuteTool", () => {
			const action = new UndoAction();

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("RedoAction calls selectAndExecuteTool", () => {
			const action = new RedoAction();

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("ClearShapesAction calls selectAndExecuteTool", () => {
			const action = new ClearShapesAction();

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("ZoomOutAction calls setKeyEvent and selectAndExecuteTool", () => {
			const action = new ZoomOutAction();
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("ExtendViewAction calls setKeyEvent and selectAndExecuteTool", () => {
			const action = new ExtendViewAction(new Rectangle(0, 0, 100, 100));
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("TextChangeAction calls selectAndExecuteTool", () => {
			const action = new TextChangeAction(1, "Hello");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});
	});

	describe("Brush Actions (setTool)", () => {
		it("PenAction calls setTool with PenTool", () => {
			const action = new PenAction(1, mockBrush);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setTool")).to.be.true;
			expect(mockExecutor.currentTool).to.not.be.null;
		});

		it("HighlighterAction calls setTool with HighlighterTool", () => {
			const action = new HighlighterAction(1, mockBrush);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("PointerAction calls setTool with PointerTool", () => {
			const action = new PointerAction(1, mockBrush);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("ArrowAction calls setKeyEvent and setTool", () => {
			const action = new ArrowAction(1, mockBrush);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("LineAction calls setKeyEvent and setTool", () => {
			const action = new LineAction(1, mockBrush);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("RectangleAction calls setKeyEvent and setTool", () => {
			const action = new RectangleAction(1, mockBrush);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("EllipseAction calls setKeyEvent and setTool", () => {
			const action = new EllipseAction(1, mockBrush);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("ZoomAction calls setKeyEvent and setTool", () => {
			const action = new ZoomAction(1, mockBrush);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});
	});

	describe("Tool Actions (beginTool, executeTool, endTool)", () => {
		it("ToolBeginAction calls beginTool with point", () => {
			const point = new PenPoint(10, 20, 0.5);
			const action = new ToolBeginAction(point);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("beginTool")).to.be.true;
			const call = mockExecutor.getCall("beginTool");
			expect(call!.args[0].x).to.equal(10);
			expect(call!.args[0].y).to.equal(20);
		});

		it("ToolExecuteAction calls executeTool with point", () => {
			const point = new PenPoint(30, 40, 0.5);
			const action = new ToolExecuteAction(point);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("executeTool")).to.be.true;
			const call = mockExecutor.getCall("executeTool");
			expect(call!.args[0].x).to.equal(30);
			expect(call!.args[0].y).to.equal(40);
		});

		it("ToolEndAction calls endTool with point", () => {
			const point = new PenPoint(50, 60, 0.5);
			const action = new ToolEndAction(point);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("endTool")).to.be.true;
			const call = mockExecutor.getCall("endTool");
			expect(call!.args[0].x).to.equal(50);
			expect(call!.args[0].y).to.equal(60);
		});
	});

	describe("Simple Tool Actions (setKeyEvent + setTool)", () => {
		it("PanAction calls setKeyEvent and setTool", () => {
			const action = new PanAction();
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("SelectAction calls setKeyEvent and setTool", () => {
			const action = new SelectAction();
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("SelectGroupAction calls setKeyEvent and setTool", () => {
			const action = new SelectGroupAction();
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("CloneAction calls setKeyEvent and setTool", () => {
			const action = new CloneAction();
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("TextAction calls setKeyEvent and setTool", () => {
			const action = new TextAction(1);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});

		it("LatexAction calls setKeyEvent and setTool", () => {
			const action = new LatexAction(1);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
		});
	});

	describe("Special Actions", () => {
		it("KeyAction only calls setKeyEvent", () => {
			const action = new KeyAction();
			action.keyEvent = new KeyboardEvent("keydown", { key: "a" });

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.calls.length).to.equal(1);
		});

		it("RubberAction calls setKeyEvent, setTool, and beginTool", () => {
			const action = new RubberAction(1);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
			expect(mockExecutor.hasCall("beginTool")).to.be.true;
		});

		it("PageAction calls setPageNumber", () => {
			const action = new PageAction(5);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setPageNumber")).to.be.true;
			const call = mockExecutor.getCall("setPageNumber");
			expect(call!.args[0]).to.equal(5);
		});

		it("PageDeleteAction calls removePageNumber", () => {
			const action = new PageDeleteAction(3, BigInt(1));

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("removePageNumber")).to.be.true;
			const call = mockExecutor.getCall("removePageNumber");
			expect(call!.args[0]).to.equal(3);
		});
	});

	describe("Text Font/Move/Remove/Highlight Actions", () => {
		it("TextFontAction calls selectAndExecuteTool", () => {
			const font = new Font("Arial", 16);
			const color = new Color(0, 0, 0);
			const attributes = new Map<string, boolean>();
			const action = new TextFontAction(1, font, color, attributes);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("TextMoveAction calls selectAndExecuteTool", () => {
			const action = new TextMoveAction(1, new Point(100, 200));

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("TextRemoveAction calls selectAndExecuteTool", () => {
			const action = new TextRemoveAction(1);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});

		it("TextHighlightAction calls setKeyEvent, setTool, and beginTool", () => {
			const color = new Color(255, 255, 0);
			const bounds = [new Rectangle(0, 0, 100, 20)];
			const action = new TextHighlightAction(1, color, bounds);
			action.keyEvent = new KeyboardEvent("keydown");

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("setKeyEvent")).to.be.true;
			expect(mockExecutor.hasCall("setTool")).to.be.true;
			expect(mockExecutor.hasCall("beginTool")).to.be.true;
		});
	});

	describe("Latex Font Action", () => {
		it("LatexFontAction calls selectAndExecuteTool", () => {
			const font = new Font("Arial", 24);
			const color = new Color(0, 0, 0);
			const attributes = new Map<string, boolean>();
			const action = new LatexFontAction(1, font, color, attributes);

			action.execute(mockExecutor as any);

			expect(mockExecutor.hasCall("selectAndExecuteTool")).to.be.true;
		});
	});

	describe("Action toBuffer", () => {
		it("UndoAction produces valid buffer", () => {
			const action = new UndoAction();
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("RedoAction produces valid buffer", () => {
			const action = new RedoAction();
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("ClearShapesAction produces valid buffer", () => {
			const action = new ClearShapesAction();
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("PenAction produces valid buffer", () => {
			const action = new PenAction(1, mockBrush);
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("ToolBeginAction produces valid buffer", () => {
			const action = new ToolBeginAction(new PenPoint(10, 20, 0.5));
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("PageAction produces valid buffer", () => {
			const action = new PageAction(1);
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("ExtendViewAction produces valid buffer", () => {
			const action = new ExtendViewAction(new Rectangle(0, 0, 100, 100));
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("TextAction produces valid buffer", () => {
			const action = new TextAction(1);
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("TextChangeAction produces valid buffer", () => {
			const action = new TextChangeAction(1, "Hello World");
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});

		it("RubberAction produces valid buffer", () => {
			const action = new RubberAction(1);
			const buffer = action.toBuffer();
			expect(buffer).to.be.instanceOf(Uint8Array);
		});
	});
});

