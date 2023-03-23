import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ZoomOutTool } from "../tool/zoom-out.tool";
import { ActionType } from "./action-type";

export class ZoomOutAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.selectAndExecuteTool(new ZoomOutTool());
	}

	getActionType(): ActionType {
		return ActionType.ZOOM_OUT;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}