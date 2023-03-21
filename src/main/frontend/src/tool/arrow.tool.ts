import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { ArrowShape } from "../model/shape/arrow.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";

export class ArrowTool extends PaintTool {

	private shape: ArrowShape;

	private context: ToolContext;


	begin(point: PenPoint, context: ToolContext): void {
		this.context = context;

		this.shape = new ArrowShape(this.shapeHandle, this.brush);
		this.shape.setP0(point);

		context.page.addAction(new AddShapeAction([this.shape]));
	}

	execute(point: PenPoint): void {
		this.shape.setKeyEvent(this.context.keyEvent);
		this.shape.setP1(point);
	}

	getType(): ToolType {
		return ToolType.ARROW;
	}
}