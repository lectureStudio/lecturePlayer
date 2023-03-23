import { Tool, ToolType } from "./tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { Rectangle } from "../geometry/rectangle";
import { Action } from "../action/action";
import { PanAction } from "../action/pan.action";
import { PenPoint } from "../geometry/pen-point";

export class PanTool extends Tool {

	private lastPoint: Point;


	begin(point: PenPoint, context: ToolContext): void {
		this.lastPoint = point;

		super.begin(point, context);
	}

	execute(point: PenPoint): void {
		const slideShape = this.context.page.getSlideShape();
		const pageRect = slideShape.bounds;

		const x = pageRect.x + (this.lastPoint.x - point.x);
		const y = pageRect.y + (this.lastPoint.y - point.y);

		slideShape.setPageRect(new Rectangle(x, y, pageRect.width, pageRect.height));

		this.lastPoint = point;

		super.execute(point);
	}

	getType(): ToolType {
		return ToolType.PANNING;
	}

	createAction(): Action {
		return new PanAction();
	}
}