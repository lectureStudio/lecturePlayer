import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { RectangleShape } from "../model/shape/rectangle.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { RectangleAction } from "../action/rectangle.action";

export class RectangleTool extends PaintTool {

	private shape: RectangleShape;


	begin(point: PenPoint, context: ToolContext): void {
		this.shape = new RectangleShape(this.shapeHandle, this.brush);
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
		return ToolType.RECTANGLE;
	}

	createAction(): Action {
		return new RectangleAction(this.shapeHandle, this.brush);
	}
}