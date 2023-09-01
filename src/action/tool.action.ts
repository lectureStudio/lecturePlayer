import { Action } from "./action";
import { PenPoint } from "../geometry/pen-point";

export abstract class ToolAction extends Action {

	point: PenPoint;


	constructor(point?: PenPoint) {
		super();

		this.point = point ? point : PenPoint.createZero();
	}

	override toBuffer(): ArrayBuffer {
		const length = this.point ? 12 : 0;
		const { buffer, dataView } = super.createBuffer(length);

		if (this.point) {
			dataView.setFloat32(13, this.point.x);
			dataView.setFloat32(17, this.point.y);
			dataView.setFloat32(21, this.point.p);
		}

		return buffer;
	}
}