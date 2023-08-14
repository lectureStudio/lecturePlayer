import { Tool, ToolType } from "./tool";
import { Brush } from "../paint/brush";
import { Action } from "../action/action";

export abstract class PaintTool extends Tool {

	private _shapeHandle: number;

	brush: Brush;


	abstract getType(): ToolType;
	abstract createAction(): Action;


	set shapeHandle(handle: number) {
		this._shapeHandle = handle;
	}

	get shapeHandle() {
		if (!this._shapeHandle) {
			this._shapeHandle = this.generateShapeHandle();
		}
		return this._shapeHandle;
	}

	protected generateShapeHandle(): number {
		const buffer = new Int32Array(1);
		self.crypto.getRandomValues(buffer);

		return buffer[0];
	}
}