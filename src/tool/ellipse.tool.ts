import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { EllipseShape } from "../model/shape/ellipse.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { EllipseAction } from "../action/ellipse.action";

export class EllipseTool extends PaintTool {

	private shape: EllipseShape;


	begin(point: PenPoint, context: ToolContext): void {
		this.shape = new EllipseShape(this.shapeHandle, this.brush);
		this.shape.setP0(point);

		context.page.addAction(new AddShapeAction([this.shape]));

		super.begin(point, context);
	}

	execute(point: PenPoint): void {
		this.shape.setKeyEvent(this.context.keyEvent);
		this.shape.setP1(point);

		super.execute(point);
	}

	getType(): ToolType {
		return ToolType.ELLIPSE;
	}

	createAction(): Action {
		return new EllipseAction(this.shapeHandle, this.brush);
	}
}