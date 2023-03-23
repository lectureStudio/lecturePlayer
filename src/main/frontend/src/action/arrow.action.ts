import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { ArrowTool } from "../tool/arrow.tool";
import { ActionType } from "./action-type";

export class ArrowAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new ArrowTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setKeyEvent(this.keyEvent);
		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.ARROW;
	}
}