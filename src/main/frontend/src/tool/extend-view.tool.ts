import { Rectangle } from "../geometry/rectangle";
import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { ToolType } from "./tool";

export class ExtendViewTool extends AtomicTool {

	private readonly rect: Rectangle;


	constructor(rect: Rectangle) {
		super();

		this.rect = rect;
	}

	begin(point: Point, context: ToolContext): void {
		context.page.getSlideShape().setPageRect(this.rect);
	}

	getType(): ToolType {
		return ToolType.EXTEND_VIEW;
	}
}