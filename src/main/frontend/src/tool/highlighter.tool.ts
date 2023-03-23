import { ToolContext } from "./tool-context";
import { PaintTool } from "./paint.tool";
import { PenPoint } from "../geometry/pen-point";
import { StrokeShape } from "../model/shape/stroke.shape";
import { AddShapeAction } from "../model/action/add-shape.action";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { HighlighterAction } from "../action/highlighter.action";

export class HighlighterTool extends PaintTool {

	private shape: StrokeShape;


	begin(point: PenPoint, context: ToolContext): void {
		this.shape = new StrokeShape(this.shapeHandle, this.brush);
		this.shape.addPoint(point);

		context.page.addAction(new AddShapeAction([this.shape]));

		super.begin(point, context);
	}

	execute(point: PenPoint): void {
		this.shape.addPoint(point);

		super.execute(point);
	}

	getType(): ToolType {
		return ToolType.HIGHLIGHTER;
	}

	createAction(): Action {
		return new HighlighterAction(this.shapeHandle, this.brush);
	}
}