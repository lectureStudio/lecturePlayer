import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { ArrowShape } from "../model/shape/arrow.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { ArrowAction } from "../action/arrow.action";

export class ArrowTool extends PaintTool {

	private shape: ArrowShape;


	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new ArrowShape(this.shapeHandle, this.brush);
		this.shape.setP0(point);

		context.page.addAction(new AddShapeAction([this.shape]));

		super.begin(point, context);
	}

	override execute(point: PenPoint): void {
		this.shape.setKeyEvent(this.context.keyEvent);
		this.shape.setP1(point);

		super.execute(point);
	}

	getType(): ToolType {
		return ToolType.ARROW;
	}

	createAction(): Action {
		return new ArrowAction(this.shapeHandle, this.brush);
	}
}