import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { PointerTool } from "../tool/pointer.tool";
import { ActionType } from "./action-type";

export class PointerAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new PointerTool();
		tool.brush = this.brush;

		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.POINTER;
	}
}