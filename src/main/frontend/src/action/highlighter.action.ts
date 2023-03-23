import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { HighlighterTool } from "../tool/highlighter.tool";
import { ActionType } from "./action-type";

export class HighlighterAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new HighlighterTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.HIGHLIGHTER;
	}
}