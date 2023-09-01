import { TypesettingShape } from "./typesetting.shape";
import { ShapeEvent } from "./shape-event";
import { Font } from "../../paint/font";
import { Point } from "../../geometry/point";

export class LatexShape extends TypesettingShape {

	private font: Font;


	setFont(font: Font): void {
		if (this.font && this.font.equals(font)) {
			return;
		}

		this.font = font;

		this.fireShapeEvent(new ShapeEvent(this, this.bounds));
	}

	getFont(): Font {
		return this.font;
	}

	override clone(): LatexShape {
		const shape = new LatexShape(this.handle);
		shape.setLocation(new Point(this.bounds.x, this.bounds.y));
		shape.setFont(this.font);
		shape.setTextColor(this.getTextColor());
		shape.setTextAttributes(new Map(this.getTextAttributes()));

		return shape;
	}

	public getShapeType(): string {
		return "latex";
	}
}