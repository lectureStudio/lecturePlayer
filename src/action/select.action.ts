import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { SelectTool } from "../tool/select.tool";
import { ActionType } from "./action-type";

export class SelectAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new SelectTool());
	}

	getActionType(): ActionType {
		return ActionType.SELECT;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}