import { ActionExecutor } from "./action-executor";
import { BrushAction } from "./brush.action";
import { ZoomTool } from "../tool/zoom.tool";
import { Brush } from "../paint/brush";

class ZoomAction extends BrushAction {

	constructor(shapeHandle?: number, brush?: Brush) {
		super(0, brush);
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new ZoomTool());
	}

}

export { ZoomAction };