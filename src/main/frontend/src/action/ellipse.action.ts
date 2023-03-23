import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { EllipseTool } from "../tool/ellipse.tool";
import { ActionType } from "./action-type";

export class EllipseAction extends BrushAction {

	execute(executor: ActionExecutor): void {
		const tool = new EllipseTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setKeyEvent(this.keyEvent);
		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.ELLIPSE;
	}
}