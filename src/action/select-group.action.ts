import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { SelectGroupTool } from "../tool/select-group.tool";
import { ActionType } from "./action-type";

export class SelectGroupAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new SelectGroupTool());
	}

	getActionType(): ActionType {
		return ActionType.SELECT_GROUP;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}