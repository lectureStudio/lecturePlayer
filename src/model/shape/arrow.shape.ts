import { FormShape } from "./form.shape";

export class ArrowShape extends FormShape {

	override clone(): ArrowShape {
		const shape = new ArrowShape(this.handle, this.brush.clone());
		shape.bounds.set(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		shape.setKeyEvent(this.getKeyEvent());
		shape.setSelected(this.isSelected());

		for (const point of this.points) {
			shape.points.push(point.clone());
		}

		return shape;
	}

	public override getShapeType(): string {
		return "arrow";
	}
}