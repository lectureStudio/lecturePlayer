import { expect } from "@open-wc/testing";
import { ActionParser } from "./action.parser.js";
import { ProgressiveDataView } from "./progressive-data-view.js";
import { ActionType } from "../action-type.js";
import { UndoAction } from "../undo.action.js";
import { RedoAction } from "../redo.action.js";
import { ClearShapesAction } from "../clear-shapes.action.js";
import { PenAction } from "../pen.action.js";
import { ToolBeginAction } from "../tool-begin.action.js";
import { ExtendViewAction } from "../extend-view.action.js";
import { TextAction } from "../text.action.js";
import { TextChangeAction } from "../text-change.action.js";
import { KeyAction } from "../key.action.js";
import { CloneAction } from "../clone.action.js";
import { SelectAction } from "../select.action.js";
import { SelectGroupAction } from "../select-group.action.js";
import { PanAction } from "../pan.action.js";
import { ZoomOutAction } from "../zoom-out.action.js";
import { ZoomAction } from "../zoom.action.js";
import { RubberAction } from "../rubber.action.js";
import { LatexAction } from "../latex.action.js";
import { LatexFontAction } from "../latex-font.action.js";
import { TextFontAction } from "../text-font.action.js";
import { TextMoveAction } from "../text-move.action.js";
import { TextRemoveAction } from "../text-remove.action.js";
import { TextHighlightAction } from "../text-highlight.action.js";

/**
 * Helper to create a buffer with action header (no key event)
 */
function createActionBuffer(payloadSize: number): { buffer: ArrayBuffer, dataView: DataView } {
	const buffer = new ArrayBuffer(4 + payloadSize);
	const dataView = new DataView(buffer);
	// Set header - no key event (0)
	dataView.setInt32(0, 0);
	return { buffer, dataView };
}

/**
 * Helper to create a buffer with brush action data
 */
function createBrushActionBuffer(): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	// Header (4) + shapeHandle (4) + rgba (4) + lineCap (1) + brushWidth (8) = 21 bytes
	const { buffer, dataView } = createActionBuffer(17);

	dataView.setInt32(4, 123);       // shapeHandle
	dataView.setInt32(8, 0xFF0000FF);  // rgba (red with full alpha)
	dataView.setInt8(12, 0);         // lineCap
	dataView.setFloat64(13, 5.0);    // brushWidth

	return { buffer, view: new ProgressiveDataView(buffer) };
}

/**
 * Helper to create a buffer with tool drag action data
 */
function createToolDragActionBuffer(): { buffer: ArrayBuffer, view: ProgressiveDataView } {
	// Header (4) + x (4) + y (4) + pressure (4) = 16 bytes
	const { buffer, dataView } = createActionBuffer(12);

	dataView.setFloat32(4, 100.0);   // x
	dataView.setFloat32(8, 200.0);   // y
	dataView.setFloat32(12, 0.5);    // pressure

	return { buffer, view: new ProgressiveDataView(buffer) };
}

describe("ActionParser", () => {
	describe("atomic actions", () => {
		it("parses UndoAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.UNDO, 0);

			expect(action).to.be.instanceOf(UndoAction);
		});

		it("parses RedoAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.REDO, 0);

			expect(action).to.be.instanceOf(RedoAction);
		});

		it("parses ClearShapesAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.CLEAR_SHAPES, 0);

			expect(action).to.be.instanceOf(ClearShapesAction);
		});
	});

	describe("brush actions", () => {
		it("parses PenAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.PEN, 17);

			expect(action).to.be.instanceOf(PenAction);
			const penAction = action as PenAction;
			expect(penAction.shapeHandle).to.equal(123);
			expect(penAction.brush.width).to.equal(5.0);
		});

		it("parses HighlighterAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.HIGHLIGHTER, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.HIGHLIGHTER);
		});

		it("parses PointerAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.POINTER, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.POINTER);
		});

		it("parses ArrowAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.ARROW, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.ARROW);
		});

		it("parses LineAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.LINE, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.LINE);
		});

		it("parses RectangleAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.RECTANGLE, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.RECTANGLE);
		});

		it("parses EllipseAction", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.ELLIPSE, 17);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.ELLIPSE);
		});
	});

	describe("tool drag actions", () => {
		it("parses ToolBeginAction", () => {
			const { view } = createToolDragActionBuffer();

			const action = ActionParser.parse(view, ActionType.TOOL_BEGIN, 12);

			expect(action).to.be.instanceOf(ToolBeginAction);
			const toolAction = action as ToolBeginAction;
			expect(toolAction.point.x).to.be.closeTo(100.0, 0.01);
			expect(toolAction.point.y).to.be.closeTo(200.0, 0.01);
		});

		it("parses ToolExecuteAction", () => {
			const { view } = createToolDragActionBuffer();

			const action = ActionParser.parse(view, ActionType.TOOL_EXECUTE, 12);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.TOOL_EXECUTE);
		});

		it("parses ToolEndAction", () => {
			const { view } = createToolDragActionBuffer();

			const action = ActionParser.parse(view, ActionType.TOOL_END, 12);

			expect(action).to.not.be.null;
			expect(action!.getActionType()).to.equal(ActionType.TOOL_END);
		});
	});

	describe("extend view action", () => {
		it("parses ExtendViewAction", () => {
			// Header (4) + x (8) + y (8) + w (8) + h (8) = 36 bytes
			const { buffer, dataView } = createActionBuffer(32);

			dataView.setFloat64(4, 10.0);   // x
			dataView.setFloat64(12, 20.0);  // y
			dataView.setFloat64(20, 100.0); // width
			dataView.setFloat64(28, 200.0); // height

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.EXTEND_VIEW, 32);

			expect(action).to.be.instanceOf(ExtendViewAction);
			expect(action!.getActionType()).to.equal(ActionType.EXTEND_VIEW);
		});
	});

	describe("text actions", () => {
		it("parses TextAction", () => {
			// Header (4) + handle (4) = 8 bytes
			const { buffer, dataView } = createActionBuffer(4);

			dataView.setInt32(4, 42); // text handle

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT, 4);

			expect(action).to.be.instanceOf(TextAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT);
		});

		it("parses TextChangeAction", () => {
			const text = "Hello";
			// Header (4) + handle (4) + textLength (4) + text (5) = 17 bytes
			const { buffer, dataView } = createActionBuffer(13);

			dataView.setInt32(4, 42);           // text handle
			dataView.setInt32(8, text.length);  // text length

			for (let i = 0; i < text.length; i++) {
				dataView.setUint8(12 + i, text.charCodeAt(i));
			}

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_CHANGE, 13);

			expect(action).to.be.instanceOf(TextChangeAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_CHANGE);
		});
	});

	describe("key event handling", () => {
		it("parses action with key event", () => {
			// Create buffer with key event flag set
			const buffer = new ArrayBuffer(17); // 4 header + 4 keyCode + 4 modifiers + 1 action type + 4 extra
			const dataView = new DataView(buffer);

			// Header with KEY_EVENT_MASK set (bit 0 = 1)
			dataView.setInt32(0, 1);
			// Key event data
			dataView.setInt32(4, 65);  // keyCode (A)
			dataView.setInt32(8, 2);   // modifiers (shift = bit 1)
			dataView.setInt8(12, 0);   // action type (keydown = 0)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.UNDO, 13);

			expect(action).to.not.be.null;
			expect(action!.keyEvent).to.not.be.undefined;
			expect(action!.keyEvent!.shiftKey).to.be.true;
			expect(action!.keyEvent!.type).to.equal("keydown");
		});

		it("parses keyup event", () => {
			const buffer = new ArrayBuffer(17);
			const dataView = new DataView(buffer);

			dataView.setInt32(0, 1);   // KEY_EVENT_MASK
			dataView.setInt32(4, 65);  // keyCode
			dataView.setInt32(8, 4);   // modifiers (ctrl = bit 2)
			dataView.setInt8(12, 1);   // action type (keyup = 1)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.UNDO, 13);

			expect(action!.keyEvent!.type).to.equal("keyup");
			expect(action!.keyEvent!.ctrlKey).to.be.true;
		});

		it("parses keypress event", () => {
			const buffer = new ArrayBuffer(17);
			const dataView = new DataView(buffer);

			dataView.setInt32(0, 1);   // KEY_EVENT_MASK
			dataView.setInt32(4, 65);  // keyCode
			dataView.setInt32(8, 8);   // modifiers (alt = bit 3)
			dataView.setInt8(12, 2);   // action type (keypress = 2)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.UNDO, 13);

			expect(action!.keyEvent!.type).to.equal("keypress");
			expect(action!.keyEvent!.altKey).to.be.true;
		});
	});

	describe("additional atomic actions", () => {
		it("parses KeyAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.KEY, 0);

			expect(action).to.be.instanceOf(KeyAction);
		});

		it("parses CloneAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.CLONE, 0);

			expect(action).to.be.instanceOf(CloneAction);
		});

		it("parses SelectAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.SELECT, 0);

			expect(action).to.be.instanceOf(SelectAction);
		});

		it("parses SelectGroupAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.SELECT_GROUP, 0);

			expect(action).to.be.instanceOf(SelectGroupAction);
		});

		it("parses PanAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.PANNING, 0);

			expect(action).to.be.instanceOf(PanAction);
		});

		it("parses ZoomOutAction", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			const action = ActionParser.parse(view, ActionType.ZOOM_OUT, 0);

			expect(action).to.be.instanceOf(ZoomOutAction);
		});
	});

	describe("zoom action", () => {
		it("parses ZoomAction (brush action)", () => {
			const { view } = createBrushActionBuffer();

			const action = ActionParser.parse(view, ActionType.ZOOM, 17);

			expect(action).to.be.instanceOf(ZoomAction);
			expect(action!.getActionType()).to.equal(ActionType.ZOOM);
		});
	});

	describe("rubber action", () => {
		it("parses RubberAction", () => {
			// Header (4) + shapeHandle (4) = 8 bytes
			const { buffer, dataView } = createActionBuffer(4);

			dataView.setInt32(4, 456); // shapeHandle

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.RUBBER_EXT, 4);

			expect(action).to.be.instanceOf(RubberAction);
			expect(action!.getActionType()).to.equal(ActionType.RUBBER_EXT);
		});
	});

	describe("latex actions", () => {
		it("parses LatexAction", () => {
			// Header (4) + handle (4) = 8 bytes
			const { buffer, dataView } = createActionBuffer(4);

			dataView.setInt32(4, 789); // latex handle

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.LATEX, 4);

			expect(action).to.be.instanceOf(LatexAction);
			expect(action!.getActionType()).to.equal(ActionType.LATEX);
		});

		it("parses LatexFontAction", () => {
			// Header (4) + handle (4) + fontType (4) + fontSize (4) + rgba (4) = 20 bytes
			const { buffer, dataView } = createActionBuffer(16);

			dataView.setInt32(4, 101);      // handle
			dataView.setInt32(8, 0);        // fontType
			dataView.setFloat32(12, 24.0);  // fontSize
			dataView.setInt32(16, 0xFF0000FF); // rgba (red)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.LATEX_FONT_CHANGE, 16);

			expect(action).to.be.instanceOf(LatexFontAction);
			expect(action!.getActionType()).to.equal(ActionType.LATEX_FONT_CHANGE);
		});
	});

	describe("additional text actions", () => {
		it("parses TextFontAction", () => {
			const fontFamily = "Arial";
			// Header (4) + handle (4) + rgba (4) + fontFamilyLength (4) + fontFamily (5) + fontSize (8) + posture (1) + weight (1) + strikethrough (1) + underline (1) = 33 bytes
			const { buffer, dataView } = createActionBuffer(29);

			let offset = 4;
			dataView.setInt32(offset, 202); offset += 4;       // handle
			dataView.setInt32(offset, 0x0000FFFF); offset += 4; // rgba (blue)
			dataView.setInt32(offset, fontFamily.length); offset += 4; // fontFamilyLength

			// Write font family
			for (let i = 0; i < fontFamily.length; i++) {
				dataView.setUint8(offset + i, fontFamily.charCodeAt(i));
			}
			offset += fontFamily.length;

			dataView.setFloat64(offset, 16.0); offset += 8;    // fontSize
			dataView.setInt8(offset, 0); offset += 1;          // posture (normal)
			dataView.setInt8(offset, 3); offset += 1;          // weight (400 = normal)
			dataView.setInt8(offset, 0); offset += 1;          // strikethrough (false)
			dataView.setInt8(offset, 1);                       // underline (true)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_FONT_CHANGE, 29);

			expect(action).to.be.instanceOf(TextFontAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_FONT_CHANGE);
		});

		it("parses TextFontAction with italic style", () => {
			const fontFamily = "Times";
			// Header (4) + handle (4) + rgba (4) + fontFamilyLength (4) + fontFamily (5) + fontSize (8) + posture (1) + weight (1) + strikethrough (1) + underline (1) = 33 bytes
			const { buffer, dataView } = createActionBuffer(29);

			let offset = 4;
			dataView.setInt32(offset, 303); offset += 4;       // handle
			dataView.setInt32(offset, 0x00FF00FF); offset += 4; // rgba (green)
			dataView.setInt32(offset, fontFamily.length); offset += 4;

			for (let i = 0; i < fontFamily.length; i++) {
				dataView.setUint8(offset + i, fontFamily.charCodeAt(i));
			}
			offset += fontFamily.length;

			dataView.setFloat64(offset, 14.0); offset += 8;
			dataView.setInt8(offset, 1); offset += 1;          // posture (italic)
			dataView.setInt8(offset, 6); offset += 1;          // weight (700 = bold)
			dataView.setInt8(offset, 1); offset += 1;          // strikethrough (true)
			dataView.setInt8(offset, 0);                       // underline (false)

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_FONT_CHANGE, 29);

			expect(action).to.be.instanceOf(TextFontAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_FONT_CHANGE);
		});

		it("parses TextMoveAction", () => {
			// Header (4) + handle (4) + x (8) + y (8) = 24 bytes
			const { buffer, dataView } = createActionBuffer(20);

			dataView.setInt32(4, 404);       // handle
			dataView.setFloat64(8, 150.5);   // x
			dataView.setFloat64(16, 250.5);  // y

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_LOCATION_CHANGE, 20);

			expect(action).to.be.instanceOf(TextMoveAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_LOCATION_CHANGE);
		});

		it("parses TextRemoveAction", () => {
			// Header (4) + handle (4) = 8 bytes
			const { buffer, dataView } = createActionBuffer(4);

			dataView.setInt32(4, 505); // handle

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_REMOVE, 4);

			expect(action).to.be.instanceOf(TextRemoveAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_REMOVE);
		});

		it("parses TextHighlightAction with no bounds", () => {
			// Header (4) + handle (4) + rgba (4) + count (4) = 16 bytes
			const { buffer, dataView } = createActionBuffer(12);

			dataView.setInt32(4, 606);        // handle
			dataView.setInt32(8, 0xFFFF00FF); // rgba (yellow)
			dataView.setInt32(12, 0);         // count = 0

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_SELECTION_EXT, 12);

			expect(action).to.be.instanceOf(TextHighlightAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_SELECTION_EXT);
		});

		it("parses TextHighlightAction with bounds", () => {
			// Header (4) + handle (4) + rgba (4) + count (4) + (x,y,w,h) * 2 = 80 bytes
			// Each bound: x (8) + y (8) + w (8) + h (8) = 32 bytes
			const { buffer, dataView } = createActionBuffer(76);

			let offset = 4;
			dataView.setInt32(offset, 707); offset += 4;        // handle
			dataView.setInt32(offset, 0x00FFFFFF); offset += 4; // rgba (cyan)
			dataView.setInt32(offset, 2); offset += 4;          // count = 2

			// First bound
			dataView.setFloat64(offset, 10.0); offset += 8;     // x1
			dataView.setFloat64(offset, 20.0); offset += 8;     // y1
			dataView.setFloat64(offset, 100.0); offset += 8;    // w1
			dataView.setFloat64(offset, 50.0); offset += 8;     // h1

			// Second bound
			dataView.setFloat64(offset, 10.0); offset += 8;     // x2
			dataView.setFloat64(offset, 80.0); offset += 8;     // y2
			dataView.setFloat64(offset, 100.0); offset += 8;    // w2
			dataView.setFloat64(offset, 50.0);                  // h2

			const view = new ProgressiveDataView(buffer);
			const action = ActionParser.parse(view, ActionType.TEXT_SELECTION_EXT, 76);

			expect(action).to.be.instanceOf(TextHighlightAction);
			expect(action!.getActionType()).to.equal(ActionType.TEXT_SELECTION_EXT);
		});
	});

	describe("returns null for unknown action types", () => {
		it("returns null for unhandled action type", () => {
			const { buffer } = createActionBuffer(0);
			const view = new ProgressiveDataView(buffer);

			// Use a value that's not in the switch statement
			const action = ActionParser.parse(view, ActionType.STATIC, 0);

			expect(action).to.be.null;
		});
	});
});

