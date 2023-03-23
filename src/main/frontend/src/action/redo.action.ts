import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { RedoTool } from "../tool/redo.tool";
import { ActionType } from "./action-type";

export class RedoAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new RedoTool());
	}

	getActionType(): ActionType {
		return ActionType.REDO;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}