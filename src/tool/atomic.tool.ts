import { Tool, ToolType } from "./tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";
import { Action } from "../action/action";

export abstract class AtomicTool extends Tool {

	abstract override begin(point: Point, context: ToolContext): void;

	abstract override getType(): ToolType;

	abstract override createAction(): Action;


	override execute(_point: Point): void {
		// No action
	}

	override end(_point: Point): void {
		// No action
	}
}