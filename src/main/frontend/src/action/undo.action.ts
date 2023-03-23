import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { UndoTool } from "../tool/undo.tool";
import { ActionType } from "./action-type";

export class UndoAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new UndoTool());
	}

	getActionType(): ActionType {
		return ActionType.UNDO;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}