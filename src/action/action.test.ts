import { expect } from "@open-wc/testing";
import { ActionType } from "./action-type.js";
import { UndoAction } from "./undo.action.js";
import { RedoAction } from "./redo.action.js";
import { ClearShapesAction } from "./clear-shapes.action.js";
import { CloneAction } from "./clone.action.js";
import { SelectAction } from "./select.action.js";
import { SelectGroupAction } from "./select-group.action.js";
import { KeyAction } from "./key.action.js";
import { PanAction } from "./pan.action.js";
import { ZoomOutAction } from "./zoom-out.action.js";
import { PenAction } from "./pen.action.js";
import { HighlighterAction } from "./highlighter.action.js";
import { PointerAction } from "./pointer.action.js";
import { ArrowAction } from "./arrow.action.js";
import { LineAction } from "./line.action.js";
import { RectangleAction } from "./rectangle.action.js";
import { EllipseAction } from "./ellipse.action.js";
import { ZoomAction } from "./zoom.action.js";
import { ToolBeginAction } from "./tool-begin.action.js";
import { ToolExecuteAction } from "./tool-execute.action.js";
import { ToolEndAction } from "./tool-end.action.js";
import { TextAction } from "./text.action.js";
import { TextChangeAction } from "./text-change.action.js";
import { TextRemoveAction } from "./text-remove.action.js";
import { RubberAction } from "./rubber.action.js";
import { ExtendViewAction } from "./extend-view.action.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";
import { PenPoint } from "../geometry/pen-point.js";
import { Rectangle } from "../geometry/rectangle.js";

function createBrush(): Brush {
	return new Brush(new Color(255, 0, 0), 5);
}

describe("Atomic Actions", () => {
	describe("UndoAction", () => {
		it("returns correct action type", () => {
			const action = new UndoAction();
			expect(action.getActionType()).to.equal(ActionType.UNDO);
		});

		it("creates buffer", () => {
			const action = new UndoAction();
			const buffer = action.toBuffer();
			// toBuffer returns Uint8Array.buffer which is an ArrayBuffer
			expect(buffer.byteLength).to.be.greaterThan(0);
		});
	});

	describe("RedoAction", () => {
		it("returns correct action type", () => {
			const action = new RedoAction();
			expect(action.getActionType()).to.equal(ActionType.REDO);
		});

		it("creates buffer", () => {
			const action = new RedoAction();
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(0);
		});
	});

	describe("ClearShapesAction", () => {
		it("returns correct action type", () => {
			const action = new ClearShapesAction();
			expect(action.getActionType()).to.equal(ActionType.CLEAR_SHAPES);
		});
	});

	describe("CloneAction", () => {
		it("returns correct action type", () => {
			const action = new CloneAction();
			expect(action.getActionType()).to.equal(ActionType.CLONE);
		});
	});

	describe("SelectAction", () => {
		it("returns correct action type", () => {
			const action = new SelectAction();
			expect(action.getActionType()).to.equal(ActionType.SELECT);
		});
	});

	describe("SelectGroupAction", () => {
		it("returns correct action type", () => {
			const action = new SelectGroupAction();
			expect(action.getActionType()).to.equal(ActionType.SELECT_GROUP);
		});
	});

	describe("KeyAction", () => {
		it("returns correct action type", () => {
			const action = new KeyAction();
			expect(action.getActionType()).to.equal(ActionType.KEY);
		});
	});

	describe("PanAction", () => {
		it("returns correct action type", () => {
			const action = new PanAction();
			expect(action.getActionType()).to.equal(ActionType.PANNING);
		});
	});

	describe("ZoomOutAction", () => {
		it("returns correct action type", () => {
			const action = new ZoomOutAction();
			expect(action.getActionType()).to.equal(ActionType.ZOOM_OUT);
		});
	});
});

describe("Brush Actions", () => {
	describe("PenAction", () => {
		it("returns correct action type", () => {
			const action = new PenAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.PEN);
		});

		it("stores shape handle", () => {
			const action = new PenAction(42, createBrush());
			expect(action.shapeHandle).to.equal(42);
		});

		it("stores brush", () => {
			const brush = createBrush();
			const action = new PenAction(1, brush);
			expect(action.brush).to.equal(brush);
		});

		it("creates buffer with brush data", () => {
			const action = new PenAction(1, createBrush());
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(13); // header + brush data
		});
	});

	describe("HighlighterAction", () => {
		it("returns correct action type", () => {
			const action = new HighlighterAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.HIGHLIGHTER);
		});
	});

	describe("PointerAction", () => {
		it("returns correct action type", () => {
			const action = new PointerAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.POINTER);
		});
	});

	describe("ArrowAction", () => {
		it("returns correct action type", () => {
			const action = new ArrowAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.ARROW);
		});
	});

	describe("LineAction", () => {
		it("returns correct action type", () => {
			const action = new LineAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.LINE);
		});
	});

	describe("RectangleAction", () => {
		it("returns correct action type", () => {
			const action = new RectangleAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.RECTANGLE);
		});
	});

	describe("EllipseAction", () => {
		it("returns correct action type", () => {
			const action = new EllipseAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.ELLIPSE);
		});
	});

	describe("ZoomAction", () => {
		it("returns correct action type", () => {
			const action = new ZoomAction(1, createBrush());
			expect(action.getActionType()).to.equal(ActionType.ZOOM);
		});
	});
});

describe("Tool Drag Actions", () => {
	describe("ToolBeginAction", () => {
		it("returns correct action type", () => {
			const action = new ToolBeginAction(new PenPoint(10, 20, 0.5));
			expect(action.getActionType()).to.equal(ActionType.TOOL_BEGIN);
		});

		it("stores point", () => {
			const point = new PenPoint(10, 20, 0.5);
			const action = new ToolBeginAction(point);
			expect(action.point).to.equal(point);
		});

		it("creates buffer with point data", () => {
			const action = new ToolBeginAction(new PenPoint(10, 20, 0.5));
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(13); // header + point data
		});
	});

	describe("ToolExecuteAction", () => {
		it("returns correct action type", () => {
			const action = new ToolExecuteAction(new PenPoint(10, 20, 0.5));
			expect(action.getActionType()).to.equal(ActionType.TOOL_EXECUTE);
		});
	});

	describe("ToolEndAction", () => {
		it("returns correct action type", () => {
			const action = new ToolEndAction(new PenPoint(10, 20, 0.5));
			expect(action.getActionType()).to.equal(ActionType.TOOL_END);
		});
	});
});

describe("Text Actions", () => {
	describe("TextAction", () => {
		it("returns correct action type", () => {
			const action = new TextAction(1);
			expect(action.getActionType()).to.equal(ActionType.TEXT);
		});

		it("creates buffer with handle", () => {
			const action = new TextAction(42);
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(13); // header + handle
		});
	});

	describe("TextChangeAction", () => {
		it("returns correct action type", () => {
			const action = new TextChangeAction(1, "Hello World");
			expect(action.getActionType()).to.equal(ActionType.TEXT_CHANGE);
		});

		it("creates buffer with text", () => {
			const action = new TextChangeAction(1, "Test Text");
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(13 + 8); // header + handle + length + text
		});
	});

	describe("TextRemoveAction", () => {
		it("returns correct action type", () => {
			const action = new TextRemoveAction(1);
			expect(action.getActionType()).to.equal(ActionType.TEXT_REMOVE);
		});
	});
});

describe("Other Actions", () => {
	describe("RubberAction", () => {
		it("returns correct action type", () => {
			const action = new RubberAction(1);
			expect(action.getActionType()).to.equal(ActionType.RUBBER_EXT);
		});

		it("stores shape handle", () => {
			const action = new RubberAction(42);
			expect(action.shapeHandle).to.equal(42);
		});
	});

	describe("ExtendViewAction", () => {
		it("returns correct action type", () => {
			const action = new ExtendViewAction(new Rectangle(0, 0, 100, 100));
			expect(action.getActionType()).to.equal(ActionType.EXTEND_VIEW);
		});

		it("stores rectangle", () => {
			const rect = new Rectangle(10, 20, 100, 200);
			const action = new ExtendViewAction(rect);
			expect(action.rect).to.equal(rect);
		});

		it("creates buffer with rectangle data", () => {
			const action = new ExtendViewAction(new Rectangle(0, 0, 100, 100));
			const buffer = action.toBuffer();
			expect(buffer.byteLength).to.be.greaterThan(13); // header + rectangle data
		});
	});
});

