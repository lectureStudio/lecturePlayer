import { FormShape } from "./form.shape";

export class ZoomShape extends FormShape {

	constructor() {
		super(0, null);
	}

	public getShapeType(): string {
		return "zoom";
	}

	protected updateBounds(): void {
		super.updateBounds();

		// Keep aspect ratio with width bias.
		const width = this.bounds.width;
		const height = Math.abs(width * 3.0 / 4.0) * Math.sign(this.bounds.height);

		this.bounds.height = height;
	}
}