import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";
import { ToolAction } from "./tool.action";

export class ToolExecuteAction extends ToolAction {

	execute(executor: ActionExecutor): void {
		executor.executeTool(this.point);
	}

	getActionType(): ActionType {
		return ActionType.TOOL_EXECUTE;
	}
}