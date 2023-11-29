import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { Page } from "../model/page";
import { PointerShape } from "../model/shape/pointer.shape";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { PointerAction } from "../action/pointer.action";

export class PointerTool extends PaintTool {

	private shape: PointerShape;

	private page: Page;


	override begin(point: PenPoint, context: ToolContext): void {
		this.page = context.page;

		this.shape = new PointerShape(this.shapeHandle, this.brush);
		this.shape.addPoint(point);

		this.page.addShape(this.shape);

		super.begin(point, context);
	}

	override execute(point: PenPoint): void {
		this.shape.addPoint(point);

		super.execute(point);
	}

	override end(point: PenPoint): void {
		this.page.removeShape(this.shape);

		super.end(point);
	}

	getType(): ToolType {
		return ToolType.POINTER;
	}

	createAction(): Action {
		return new PointerAction(this.shapeHandle, this.brush);
	}
}