import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { PenTool } from "../tool/pen.tool";
import { ActionType } from "./action-type";

export class PenAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new PenTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.PEN;
	}
}