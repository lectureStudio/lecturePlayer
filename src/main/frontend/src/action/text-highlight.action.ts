import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { Rectangle } from "../geometry/rectangle";
import { TextHighlightTool } from "../tool/text-highlight.tool";
import { Color } from "../paint/color";
import { PenPoint } from "../geometry/pen-point";

class TextHighlightAction extends Action {

	private readonly shapeHandle: number;

	private readonly color: Color;

	private readonly textBounds: Rectangle[];


	constructor(shapeHandle: number, color: Color, textBounds: Rectangle[]) {
		super();

		this.shapeHandle = shapeHandle;
		this.color = color;
		this.textBounds = textBounds;
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new TextHighlightTool(this.shapeHandle, this.color, this.textBounds));
		executor.beginTool(new PenPoint(0, 0, 0));
	}
}

export { TextHighlightAction };