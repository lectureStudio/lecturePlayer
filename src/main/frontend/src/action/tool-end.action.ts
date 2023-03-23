import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";
import { ToolAction } from "./tool.action";

export class ToolEndAction extends ToolAction {

	execute(executor: ActionExecutor): void {
		executor.endTool(this.point);
	}

	getActionType(): ActionType {
		return ActionType.TOOL_END;
	}
}