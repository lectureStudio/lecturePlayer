import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { PanTool } from "../tool/pan.tool";
import { ActionType } from "./action-type";

export class PanAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new PanTool());
	}

	getActionType(): ActionType {
		return ActionType.PANNING;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}