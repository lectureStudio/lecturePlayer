import { ToolContext } from "./tool-context";
import { Tool, ToolType } from "./tool";
import { PenPoint } from "../geometry/pen-point";
import { Shape } from "../model/shape/shape";
import { RemoveShapeAction } from "../model/action/remove-shape.action";

export class RubberTool implements Tool {

	private context: ToolContext;


	begin(point: PenPoint, context: ToolContext): void {
		this.context = context;
	}

	execute(point: PenPoint): void {
		const toDelete = new Array<Shape>();

		for (const shape of this.context.page.getShapes()) {
			if (shape.contains(point)) {
				toDelete.push(shape);
			}
		}

		if (toDelete.length != 0) {
			this.context.page.addAction(new RemoveShapeAction(toDelete));
		}
	}

	end(point: PenPoint): void {
		// No-op
	}

	getType(): ToolType {
		return ToolType.RUBBER;
	}
}