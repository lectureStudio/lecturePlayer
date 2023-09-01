import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { PenPoint } from "../geometry/pen-point";
import { LatexShape } from "../model/shape/latex.shape";
import { Action } from "../action/action";
import { LatexAction } from "../action/latex.action";

export class LatexTool extends Tool {

	private readonly handle: number;

	private shape: LatexShape;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	override begin(point: PenPoint, context: ToolContext): void {
		this.shape = new LatexShape(this.handle);

		super.begin(point, context);
	}

	override execute(point: PenPoint): void {
		super.execute(point);
	}

	override end(point: PenPoint): void {
		this.shape.setLocation(point);

		this.context.page.addShape(this.shape);

		super.end(point);
	}

	getType(): ToolType {
		return ToolType.LATEX;
	}

	createAction(): Action {
		return new LatexAction(this.handle);
	}
}