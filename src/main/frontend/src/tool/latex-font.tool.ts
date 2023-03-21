import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { Color } from "../paint/color";
import { Font } from "../paint/font";
import { LatexShape } from "../model/shape/latex.shape";
import { ToolType } from "./tool";

export class LatexFontTool extends AtomicTool {

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

		for (let shape of shapes) {
			if (shape instanceof LatexShape && shape.handle === this.handle) {
				shape.setFont(this.font);
				shape.setTextColor(this.textColor);
				shape.setTextAttributes(this.textAttributes);
				break;
			}
		}
	}

	getType(): ToolType {
		return ToolType.LATEX;
	}
}