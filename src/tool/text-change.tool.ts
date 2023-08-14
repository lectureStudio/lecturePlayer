import { AtomicTool } from "./atomic.tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { TypesettingShape } from "../model/shape/typesetting.shape";
import { ToolType } from "./tool";
import { Action } from "../action/action";
import { TextChangeAction } from "../action/text-change.action";

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

		context.recordAction(this.createAction());
	}

	getType(): ToolType {
		return ToolType.TEXT;
	}

	createAction(): Action {
		return new TextChangeAction(this.handle, this.text);
	}
}