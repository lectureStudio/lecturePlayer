import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { TypesettingShape } from "../model/shape/typesetting.shape";
import { ToolType } from "./tool";

export class TextRemoveTool extends AtomicTool {

	private readonly handle: number;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	begin(point: Point, context: ToolContext): void {
		const shapes = context.page.getShapes();

		for (let shape of shapes) {
			if (shape instanceof TypesettingShape && shape.handle === this.handle) {
				context.page.removeShape(shape);
				break;
			}
		}
	}

	getType(): ToolType {
		return ToolType.TEXT;
	}
}