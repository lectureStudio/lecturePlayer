import { FormShape } from "./form.shape";

export class LineShape extends FormShape {

	clone(): LineShape {
		const shape = new LineShape(this.handle, this.brush.clone());
		shape.bounds.set(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		shape.setKeyEvent(this.getKeyEvent());
		shape.setSelected(this.isSelected());

		for (const point of this.points) {
			shape.points.push(point.clone());
		}

		return shape;
	}

	public getShapeType(): string {
		return "line";
	}
}