import { Tool, ToolType } from "./tool";
import { Point } from "../geometry/point";
import { ToolContext } from "./tool-context";

export abstract class AtomicTool implements Tool {

	abstract begin(point: Point, context: ToolContext): void;

	abstract getType(): ToolType;


	execute(point: Point): void {
		// No action
	}

	end(point: Point): void {
		// No action
	}
}