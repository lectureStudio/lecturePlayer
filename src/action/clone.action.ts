import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { CloneTool } from "../tool/clone.tool";
import { ActionType } from "./action-type";

export class CloneAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new CloneTool());
	}

	getActionType(): ActionType {
		return ActionType.CLONE;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}