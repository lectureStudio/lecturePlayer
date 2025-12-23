import { expect } from "@open-wc/testing";
import { ActionType } from "./action-type.js";

describe("ActionType", () => {
	describe("tool actions", () => {
		it("has TOOL_BEGIN", () => {
			expect(ActionType.TOOL_BEGIN).to.exist;
		});

		it("has TOOL_EXECUTE", () => {
			expect(ActionType.TOOL_EXECUTE).to.exist;
		});

		it("has TOOL_END", () => {
			expect(ActionType.TOOL_END).to.exist;
		});
	});

	describe("stroke actions", () => {
		it("has PEN", () => {
			expect(ActionType.PEN).to.exist;
		});

		it("has HIGHLIGHTER", () => {
			expect(ActionType.HIGHLIGHTER).to.exist;
		});

		it("has POINTER", () => {
			expect(ActionType.POINTER).to.exist;
		});
	});

	describe("form actions", () => {
		it("has ARROW", () => {
			expect(ActionType.ARROW).to.exist;
		});

		it("has LINE", () => {
			expect(ActionType.LINE).to.exist;
		});

		it("has RECTANGLE", () => {
			expect(ActionType.RECTANGLE).to.exist;
		});

		it("has ELLIPSE", () => {
			expect(ActionType.ELLIPSE).to.exist;
		});
	});

	describe("text actions", () => {
		it("has TEXT", () => {
			expect(ActionType.TEXT).to.exist;
		});

		it("has TEXT_CHANGE", () => {
			expect(ActionType.TEXT_CHANGE).to.exist;
		});

		it("has TEXT_FONT_CHANGE", () => {
			expect(ActionType.TEXT_FONT_CHANGE).to.exist;
		});

		it("has TEXT_LOCATION_CHANGE", () => {
			expect(ActionType.TEXT_LOCATION_CHANGE).to.exist;
		});

		it("has TEXT_REMOVE", () => {
			expect(ActionType.TEXT_REMOVE).to.exist;
		});

		it("has LATEX", () => {
			expect(ActionType.LATEX).to.exist;
		});

		it("has LATEX_FONT_CHANGE", () => {
			expect(ActionType.LATEX_FONT_CHANGE).to.exist;
		});
	});

	describe("rearrangement actions", () => {
		it("has UNDO", () => {
			expect(ActionType.UNDO).to.exist;
		});

		it("has REDO", () => {
			expect(ActionType.REDO).to.exist;
		});

		it("has CLONE", () => {
			expect(ActionType.CLONE).to.exist;
		});

		it("has SELECT", () => {
			expect(ActionType.SELECT).to.exist;
		});

		it("has SELECT_GROUP", () => {
			expect(ActionType.SELECT_GROUP).to.exist;
		});

		it("has RUBBER", () => {
			expect(ActionType.RUBBER).to.exist;
		});

		it("has CLEAR_SHAPES", () => {
			expect(ActionType.CLEAR_SHAPES).to.exist;
		});
	});

	describe("zoom actions", () => {
		it("has PANNING", () => {
			expect(ActionType.PANNING).to.exist;
		});

		it("has EXTEND_VIEW", () => {
			expect(ActionType.EXTEND_VIEW).to.exist;
		});

		it("has ZOOM", () => {
			expect(ActionType.ZOOM).to.exist;
		});

		it("has ZOOM_OUT", () => {
			expect(ActionType.ZOOM_OUT).to.exist;
		});
	});

	describe("atomic actions", () => {
		it("has NEXT_PAGE", () => {
			expect(ActionType.NEXT_PAGE).to.exist;
		});

		it("has KEY", () => {
			expect(ActionType.KEY).to.exist;
		});
	});

	describe("all values are unique", () => {
		it("has no duplicate values", () => {
			const values = Object.values(ActionType).filter(v => typeof v === "number");
			const uniqueValues = new Set(values);
			expect(uniqueValues.size).to.equal(values.length);
		});
	});
});

