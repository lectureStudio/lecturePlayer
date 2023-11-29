import { Brush } from "../../paint/brush";
import { FormShape } from "./form.shape";

export class SelectShape extends FormShape {

	constructor(brush: Brush) {
		super(0, brush);
	}

	public override getShapeType(): string {
		return "select";
	}
}