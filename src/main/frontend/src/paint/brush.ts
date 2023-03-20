import { Paint } from "./paint";
import { Color } from "./color";

export class Brush extends Paint {

	width: number;


	constructor(color: Color, width: number) {
		super(color);

		this.width = width;
	}

	clone(): Brush {
		return new Brush(this.color, this.width);
	}
}