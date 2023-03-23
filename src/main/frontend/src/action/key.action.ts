import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";

export class KeyAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
	}

	getActionType(): ActionType {
		return ActionType.KEY;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}