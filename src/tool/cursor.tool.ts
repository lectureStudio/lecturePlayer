import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { PenPoint } from "../geometry/pen-point";
import { Action } from "../action/action";

export class CursorTool extends Tool {

	begin(_point: PenPoint, _context: ToolContext): void {
		// Do nothing
	}

	execute(_point: PenPoint): void {
		// Do nothing
	}

	end(_point: PenPoint): void {
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