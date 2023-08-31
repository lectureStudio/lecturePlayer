import { Tool, ToolType } from "./tool";
import { PenPoint } from "../geometry/pen-point";
import { Shape } from "../model/shape/shape";
import { RemoveShapeAction } from "../model/action/remove-shape.action";
import { Action } from "../action/action";
import { RubberAction } from "../action/rubber.action";
import { ToolContext } from "./tool-context";

export class RubberTool extends Tool {

	begin(point: PenPoint, context: ToolContext): void {
		this.context = context;
	}

	execute(point: PenPoint): void {
		const toDelete = new Array<Shape>();

		for (const shape of this.context.page.getShapes()) {
			if (shape.contains(point)) {
				toDelete.push(shape);

				this.context.recordAction(new RubberAction(shape.handle));
			}
		}

		if (toDelete.length != 0) {
			this.context.page.addAction(new RemoveShapeAction(toDelete));
		}
	}

	end(_point: PenPoint): void {
		// Do nothing on purpose.
	}

	getType(): ToolType {
		return ToolType.RUBBER;
	}

	createAction(): Action {
		// No need to create a general action.
		return null;
	}
}