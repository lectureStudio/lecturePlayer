import { AtomicTool } from "./atomic.tool";
import { ToolContext } from "./tool-context";
import { PenPoint } from "../geometry/pen-point";
import { Rectangle } from "../geometry/rectangle";
import { ToolType } from "./tool";

export class ZoomOutTool extends AtomicTool {

	begin(point: PenPoint, context: ToolContext): void {
		context.page.getSlideShape().setPageRect(new Rectangle(0, 0, 1, 1));
	}

	getType(): ToolType {
		return ToolType.ZOOM_OUT;
	}
}