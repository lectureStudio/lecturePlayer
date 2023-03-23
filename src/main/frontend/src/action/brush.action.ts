import { Action } from "./action";
import { Brush } from "../paint/brush";

export abstract class BrushAction extends Action {

	shapeHandle: number;

	brush: Brush;


	constructor(shapeHandle: number, brush?: Brush) {
		super();

		this.shapeHandle = shapeHandle;
		this.brush = brush;
	}

	override toBuffer(): ArrayBuffer {
		const length = this.brush ? 17 : 4;
		const { buffer, dataView } = super.createBuffer(length);

		dataView.setInt32(13, this.shapeHandle);

		if (this.brush) {
			dataView.setInt32(17, this.brush.color.toRgbaNumber());
			dataView.setInt8(21, 0);
			dataView.setFloat64(22, this.brush.width);
		}

		return buffer;
	}
}