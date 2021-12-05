import { Tool } from "./tool";
import { Point } from "../geometry/point";
import { Rectangle } from "../geometry/rectangle";
import { ToolContext } from "./tool-context";
import { TextHighlightShape } from "../model/shape/text-highlight.shape";
import { Color } from "../paint/color";
import { AddShapeAction } from "../model/action/add-shape.action";

class TextHighlightTool implements Tool {

	private readonly shapeHandle: number;

	private readonly color: Color;

	private readonly textBounds: Rectangle[];


	constructor(shapeHandle: number, color: Color, textBounds: Rectangle[]) {
		this.shapeHandle = shapeHandle;
		this.color = color;
		this.textBounds = textBounds;
	}

	begin(point: Point, context: ToolContext): void {
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

	execute(point: Point): void {
		// Do nothing.
	}

	end(point: Point): void {
		// Do nothing.
	}
}

export { TextHighlightTool };