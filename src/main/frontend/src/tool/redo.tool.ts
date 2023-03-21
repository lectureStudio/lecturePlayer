import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { ToolType } from "./tool";

export class RedoTool extends AtomicTool {

	begin(point: Point, context: ToolContext): void {
		context.page.redo();
	}

	getType(): ToolType {
		return ToolType.REDO;
	}
}