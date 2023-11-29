import { ToolContext } from "./tool-context";
import { ToolType } from "./tool";
import { PaintTool } from "./paint.tool";
import { ZoomShape } from "../model/shape/zoom.shape";
import { PenPoint } from "../geometry/pen-point";
import { Action } from "../action/action";
import { ZoomAction } from "../action/zoom.action";

export class ZoomTool extends PaintTool {

	private shape: ZoomShape;

	private initialized: boolean;


	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new ZoomShape(this.brush);

		context.page.addShape(this.shape);

		super.begin(point, context);
	}

	override execute(point: PenPoint): void {
		if (!this.initialized) {
			this.shape.setP0(point);
			this.initialized = true;
		}

		this.shape.setP1(point);

		super.execute(point);
	}

	override end(point: PenPoint): void {
		this.initialized = false;

		this.context.page.removeShape(this.shape);
		this.context.page.getSlideShape().setPageRect(this.shape.bounds);

		super.end(point);
	}

	getType(): ToolType {
		return ToolType.ZOOM;
	}

	createAction(): Action {
		return new ZoomAction(this.shapeHandle, this.brush);
	}
}