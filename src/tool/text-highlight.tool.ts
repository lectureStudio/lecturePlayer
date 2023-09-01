import { Tool, ToolType } from "./tool";
import { Point } from "../geometry/point";
import { Rectangle } from "../geometry/rectangle";
import { ToolContext } from "./tool-context";
import { TextHighlightShape } from "../model/shape/text-highlight.shape";
import { Color } from "../paint/color";
import { AddShapeAction } from "../model/action/add-shape.action";
import { Action } from "../action/action";
import { TextHighlightAction } from "../action/text-highlight.action";

export class TextHighlightTool extends Tool {

	private readonly shapeHandle: number;

	private readonly color: Color;

	private readonly textBounds: Rectangle[];


	constructor(shapeHandle: number, color: Color, textBounds: Rectangle[]) {
		super();

		this.shapeHandle = shapeHandle;
		this.color = color;
		this.textBounds = textBounds;
	}

	override begin(point: Point, context: ToolContext): void {
		if (this.textBounds.length < 1) {
			return;
		}

		let selectShape: TextHighlightShape = null;

		for (const shape of context.page.getShapes()) {
			if (shape.handle === this.shapeHandle) {
				selectShape = shape as TextHighlightShape;
				break;
			}
		}

		if (!selectShape) {
			selectShape = new TextHighlightShape(this.shapeHandle, this.color);

			context.page.addAction(new AddShapeAction([selectShape]));
		}

		for (const rect of this.textBounds) {
			selectShape.addTextBounds(rect);
		}
	}

	override execute(_point: Point): void {
		// Do nothing.
	}

	override end(_point: Point): void {
		// Do nothing.
	}

	getType(): ToolType {
		return ToolType.TEXT_SELECTION;
	}

	createAction(): Action {
		return new TextHighlightAction(this.shapeHandle, this.color, this.textBounds);
	}
}