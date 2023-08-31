import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { TextShape } from "../model/shape/text.shape";
import { PenPoint } from "../geometry/pen-point";
import { Action } from "../action/action";
import { TextAction } from "../action/text.action";

export class TextTool extends Tool {

	private readonly handle: number;

	private shape: TextShape;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	begin(point: PenPoint, context: ToolContext): void {
		this.context = context;

		this.shape = new TextShape(this.handle);

		super.begin(point, context);
	}

	execute(_point: PenPoint): void {
		// No-op
	}

	end(point: PenPoint): void {
		this.shape.setLocation(point);

		this.context.page.addShape(this.shape);

		super.end(point);
	}

	getType(): ToolType {
		return ToolType.TEXT;
	}

	createAction(): Action {
		return new TextAction(this.handle);
	}
}