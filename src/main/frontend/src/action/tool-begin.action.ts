import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";
import { ToolAction } from "./tool.action";

export class ToolBeginAction extends ToolAction {

	execute(executor: ActionExecutor): void {
		executor.beginTool(this.point);
	}

	getActionType(): ActionType {
		return ActionType.TOOL_BEGIN;
	}
}