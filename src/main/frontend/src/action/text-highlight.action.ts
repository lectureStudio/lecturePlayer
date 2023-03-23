import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { Rectangle } from "../geometry/rectangle";
import { TextHighlightTool } from "../tool/text-highlight.tool";
import { Color } from "../paint/color";
import { PenPoint } from "../geometry/pen-point";
import { ActionType } from "./action-type";

export class TextHighlightAction extends Action {

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

	getActionType(): ActionType {
		return ActionType.TEXT_SELECTION_EXT;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(12 + this.textBounds.length * 32);

		dataView.setInt32(13, this.shapeHandle);
		dataView.setInt32(17, this.color.toRgbaNumber());
		dataView.setInt32(21, this.textBounds.length);

		let offset = 25;

		this.textBounds.forEach(rect => {
			dataView.setFloat64(offset, rect.x);
			dataView.setFloat64(offset + 8, rect.y);
			dataView.setFloat64(offset + 16, rect.width);
			dataView.setFloat64(offset + 24, rect.height);

			offset += 32;
		});

		return buffer;
	}
}