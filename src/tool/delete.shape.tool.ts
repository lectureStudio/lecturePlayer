import { ToolContext } from "./tool-context";
import { Tool, ToolType } from "./tool";
import { PenPoint } from "../geometry/pen-point";
import { RemoveShapeAction } from "../model/action/remove-shape.action";
import { Action } from "../action/action";
import { RubberAction } from "../action/rubber.action";

export class DeleteShapeTool extends Tool {

	private readonly shapeHandle: number;


	constructor(shapeHandle: number) {
		super();

		this.shapeHandle = shapeHandle;
	}

	override begin(point: PenPoint, context: ToolContext): void {
		for (const shape of context.page.getShapes()) {
			if (shape.handle === this.shapeHandle) {
				context.page.addAction(new RemoveShapeAction(new Array(shape)));
				break;
			}
		}
	}

	override execute(_point: PenPoint): void {
		// No-op
	}

	override end(_point: PenPoint): void {
		// No-op
	}

	getType(): ToolType {
		return ToolType.RUBBER;
	}

	createAction(): Action {
		return new RubberAction(this.shapeHandle);
	}
}