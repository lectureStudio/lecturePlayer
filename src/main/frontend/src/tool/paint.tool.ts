import { Tool, ToolType } from "./tool";
import { ToolContext } from "./tool-context";
import { Brush } from "../paint/brush";
import { PenPoint } from "../geometry/pen-point";

export abstract class PaintTool implements Tool {

	private _shapeHandle: number;

	brush: Brush;


	abstract getType(): ToolType;

	begin(point: PenPoint, context: ToolContext): void {

	}

	execute(point: PenPoint): void {

	}

	end(point: PenPoint): void {

	}

	set shapeHandle(handle: number) {
		this._shapeHandle = handle;
	}

	get shapeHandle() {
		return this._shapeHandle ? this._shapeHandle : this.generateShapeHandle();
	}

	protected generateShapeHandle(): number {
		const buffer = new Int32Array(1);
		self.crypto.getRandomValues(buffer);

		return buffer[0];
	}
}