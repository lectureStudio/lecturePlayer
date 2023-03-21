import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { RemoveShapeAction } from "../model/action/remove-shape.action";
import { Shape } from "../model/shape/shape";
import { ToolType } from "./tool";

export class ClearShapesTool extends AtomicTool {

	begin(point: Point, context: ToolContext): void {
		const shapes: Shape[] = Object.assign([], context.page.getShapes());

		context.page.addAction(new RemoveShapeAction(shapes));
	}

	getType(): ToolType {
		return ToolType.DELETE_ALL;
	}

}