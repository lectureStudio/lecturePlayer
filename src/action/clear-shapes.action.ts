import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ClearShapesTool } from "../tool/clear-shapes.tool";
import { ActionType } from "./action-type";

export class ClearShapesAction extends Action {

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new ClearShapesTool());
	}

	getActionType(): ActionType {
		return ActionType.CLEAR_SHAPES;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}