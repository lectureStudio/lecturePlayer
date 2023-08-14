import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { PenPoint } from "../geometry/pen-point";
import { Action } from "../action/action";

export class CursorTool extends Tool {

	begin(point: PenPoint, context: ToolContext): void {
		// Do nothing
	}

	execute(point: PenPoint): void {
		// Do nothing
	}

	end(point: PenPoint): void {
		// Do nothing
	}

	getType(): ToolType {
		return ToolType.CURSOR;
	}

	createAction(): Action {
		// Cursor is not recorded.
		return null;
	}
}