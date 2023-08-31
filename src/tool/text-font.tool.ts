import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { TextShape } from "../model/shape/text.shape";
import { Color } from "../paint/color";
import { Font } from "../paint/font";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { TextFontAction } from "../action/text-font.action";

export class TextFontTool extends AtomicTool {

	private readonly handle: number;

	private readonly font: Font;

	private readonly textColor: Color;

	private readonly textAttributes: Map<string, boolean>;


	constructor(handle: number, font: Font, textColor: Color, textAttributes: Map<string, boolean>) {
		super();

		this.handle = handle;
		this.font = font;
		this.textColor = textColor;
		this.textAttributes = textAttributes;
	}

	begin(point: Point, context: ToolContext): void {
		const shapes = context.page.getShapes();

		for (const shape of shapes) {
			if (shape instanceof TextShape && shape.handle === this.handle) {
				shape.setFont(this.font);
				shape.setTextColor(this.textColor);
				shape.setTextAttributes(this.textAttributes);
				break;
			}
		}

		context.recordAction(this.createAction());
	}

	getType(): ToolType {
		return ToolType.TEXT;
	}

	createAction(): Action {
		return new TextFontAction(this.handle, this.font, this.textColor, this.textAttributes);
	}
}