import { Brush } from "../../paint/brush";
import { FormShape } from "./form.shape";

export class ZoomShape extends FormShape {

	constructor(brush: Brush) {
		super(0, brush);
	}

	public override getShapeType(): string {
		return "zoom";
	}

	protected override updateBounds(): void {
		super.updateBounds();

		// Keep aspect ratio with width bias.
		const width = this.bounds.width;
		const height = Math.abs(width * 3.0 / 4.0) * Math.sign(this.bounds.height);

		this.bounds.height = height;
	}
}