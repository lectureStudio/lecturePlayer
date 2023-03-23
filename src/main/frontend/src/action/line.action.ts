import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { LineTool } from "../tool/line.tool";
import { ActionType } from "./action-type";

export class LineAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new LineTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setKeyEvent(this.keyEvent);
		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.LINE;
	}
}