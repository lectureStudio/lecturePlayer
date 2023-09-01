import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { ZoomTool } from "../tool/zoom.tool";
import { Brush } from "../paint/brush";
import { ActionType } from "./action-type";

export class ZoomAction extends BrushAction {

	constructor(shapeHandle: number, brush: Brush) {
		super(shapeHandle, brush);
	}

	execute(executor: ActionExecutor): void {
		const tool = new ZoomTool();
		tool.shapeHandle = this.shapeHandle;
		tool.brush = this.brush;

		executor.setKeyEvent(this.keyEvent);
		executor.setTool(tool);
	}

	getActionType(): ActionType {
		return ActionType.ZOOM;
	}
}