import { ToolContext } from "./tool-context";
import { Tool, ToolType } from "./tool";
import { PenPoint } from "../geometry/pen-point";
import { RemoveShapeAction } from "../model/action/remove-shape.action";

export class DeleteShapeTool implements Tool {

	private readonly shapeHandle: number;


	constructor(shapeHandle: number) {
		this.shapeHandle = shapeHandle;
	}

	begin(point: PenPoint, context: ToolContext): void {
		for (const shape of context.page.getShapes()) {
			if (shape.handle === this.shapeHandle) {
				context.page.addAction(new RemoveShapeAction(new Array(shape)));
				break;
			}
		}
	}

	execute(point: PenPoint): void {
		// No-op
	}

	end(point: PenPoint): void {
		// No-op
	}

	getType(): ToolType {
		return ToolType.RUBBER;
	}
}