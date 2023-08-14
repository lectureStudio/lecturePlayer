import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { UndoAction } from "../action/undo.action";

export class UndoTool extends AtomicTool {

	begin(point: Point, context: ToolContext): void {
		context.page.undo();

		context.recordAction(this.createAction());
	}

	getType(): ToolType {
		return ToolType.UNDO;
	}

	createAction(): Action {
		return new UndoAction();
	}
}