import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { LineShape } from "../model/shape/line.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { LineAction } from "../action/line.action";

export class LineTool extends PaintTool {

	private shape: LineShape;


	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new LineShape(this.shapeHandle, this.brush);
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
		return ToolType.LINE;
	}

	createAction(): Action {
		return new LineAction(this.shapeHandle, this.brush);
	}
}