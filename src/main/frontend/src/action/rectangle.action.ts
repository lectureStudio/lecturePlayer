import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { RectangleTool } from "../tool/rectangle.tool";
import { ActionType } from "./action-type";

export class RectangleAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new RectangleTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setKeyEvent(this.keyEvent);
		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.RECTANGLE;
	}
}