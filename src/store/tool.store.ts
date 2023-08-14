import { makeAutoObservable } from "mobx";
import { ToolType } from "../tool/tool";
import { Brush } from "../paint/brush";
import { ToolSettings } from "../model/tool";

class ToolStore {

	selectedToolType: ToolType = ToolType.CURSOR;
	selectedToolBrush: Brush;
	selectedToolSettings: ToolSettings;


	constructor() {
		makeAutoObservable(this);
	}

	setSelectedToolType(type: ToolType) {
		this.selectedToolType = type;
	}

	setSelectedToolBrush(brush: Brush) {
		this.selectedToolBrush = brush;
	}

	setSelectedToolSettings(settings: ToolSettings) {
		this.selectedToolSettings = settings;
	}
}

export const toolStore = new ToolStore();