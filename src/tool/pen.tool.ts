import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { AddShapeAction } from "../model/action/add-shape.action";
import { PenShape } from "../model/shape/pen.shape";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { PenAction } from "../action/pen.action";

export class PenTool extends PaintTool {

	private shape: PenShape;


	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new PenShape(this.shapeHandle, this.brush);
		this.shape.addPoint(point);

		context.page.addAction(new AddShapeAction([this.shape]));

		super.begin(point, context);
	}

	override execute(point: PenPoint): void {
		this.shape.addPoint(point);

		super.execute(point);
	}

	getType(): ToolType {
		return ToolType.PEN;
	}

	createAction(): Action {
		return new PenAction(this.shapeHandle, this.brush);
	}
}