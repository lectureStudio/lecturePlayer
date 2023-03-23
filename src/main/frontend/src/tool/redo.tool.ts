import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { RedoAction } from "../action/redo.action";

export class RedoTool extends AtomicTool {

	begin(point: Point, context: ToolContext): void {
		context.page.redo();

		context.recordAction(this.createAction());
	}

	getType(): ToolType {
		return ToolType.REDO;
	}

	createAction(): Action {
		return new RedoAction();
	}
}