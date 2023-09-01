import { FormShape } from "./form.shape";

export class SelectShape extends FormShape {

	constructor() {
		super(0, null);
	}

	public override getShapeType(): string {
		return "select";
	}
}