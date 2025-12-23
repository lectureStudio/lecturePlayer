import { expect } from "@open-wc/testing";
import { toolStore } from "./tool.store.js";
import { ToolType } from "../tool/tool.js";
import { Brush } from "../paint/brush.js";
import { Color } from "../paint/color.js";

describe("ToolStore", () => {
	describe("initial state", () => {
		it("starts with CURSOR tool selected", () => {
			expect(toolStore.selectedToolType).to.equal(ToolType.CURSOR);
		});
	});

	describe("setSelectedToolType", () => {
		it("sets selected tool type", () => {
			toolStore.setSelectedToolType(ToolType.PEN);
			expect(toolStore.selectedToolType).to.equal(ToolType.PEN);
		});

		it("can change to different tool types", () => {
			toolStore.setSelectedToolType(ToolType.LINE);
			expect(toolStore.selectedToolType).to.equal(ToolType.LINE);

			toolStore.setSelectedToolType(ToolType.RECTANGLE);
			expect(toolStore.selectedToolType).to.equal(ToolType.RECTANGLE);

			toolStore.setSelectedToolType(ToolType.ELLIPSE);
			expect(toolStore.selectedToolType).to.equal(ToolType.ELLIPSE);
		});
	});

	describe("setSelectedToolBrush", () => {
		it("sets selected tool brush", () => {
			const brush = new Brush(new Color(255, 0, 0), 5);
			toolStore.setSelectedToolBrush(brush);
			expect(toolStore.selectedToolBrush).to.equal(brush);
		});
	});

	describe("setSelectedToolSettings", () => {
		it("sets selected tool settings", () => {
			const settings = { lineWidth: 3 } as any;
			toolStore.setSelectedToolSettings(settings);
			expect(toolStore.selectedToolSettings).to.equal(settings);
		});
	});
});

