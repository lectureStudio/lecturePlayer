import { ToolContext } from "./tool-context";
import { Tool, ToolType } from "./tool";
import { ZoomShape } from "../model/shape/zoom.shape";
import { PenPoint } from "../geometry/pen-point";
import { Action } from "../action/action";
import { ZoomAction } from "../action/zoom.action";

export class ZoomTool extends Tool {

	private shape: ZoomShape;

	private initialized: boolean;


	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new ZoomShape();

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
		return new ZoomAction();
	}
}