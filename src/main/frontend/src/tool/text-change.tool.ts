import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { TypesettingShape } from "../model/shape/typesetting.shape";
import { ToolType } from "./tool";

export class TextChangeTool extends AtomicTool {

	private readonly handle: number;

	private readonly text: string;


	constructor(handle: number, text: string) {
		super();

		this.handle = handle;
		this.text = text;
	}

	begin(point: Point, context: ToolContext): void {
		const shapes = context.page.getShapes();

		for (let shape of shapes) {
			if (shape instanceof TypesettingShape && shape.handle === this.handle) {
				shape.setText(this.text);
				break;
			}
		}
	}

	getType(): ToolType {
		return ToolType.TEXT;
	}
}