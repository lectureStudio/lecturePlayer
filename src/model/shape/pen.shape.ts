import { StrokeShape } from "./stroke.shape";
import { PenStroke } from "../../geometry/pen-stroke";
import { Brush } from "../../paint/brush";
import { PenPoint } from "../../geometry/pen-point";
import { ShapeEvent } from "./shape-event";
import { Point } from "../../geometry/point";
import { Rectangle } from "../../geometry/rectangle";

export class PenShape extends StrokeShape {

	private stroke: PenStroke;


	constructor(shapeHandle: number, brush: Brush) {
		super(shapeHandle, brush);

		this.stroke = new PenStroke(brush.width);
	}

	override addPoint(point: PenPoint): boolean {
		// Keep only one point at a time.
		if (this.points.length > 0) {
			const prev = this.points[0];

			if (point.equals(prev)) {
				return false;
			}

			this.points[0] = point;
		}
		else {
			this.points.push(point);
		}

		this.stroke.addPoint(point);

		this.updateBounds();
		this.fireShapeEvent(new ShapeEvent(this, this.bounds));

		return true;
	}

	override contains(point: PenPoint): boolean {
		return this.stroke.intersects(new Rectangle(point.x, point.y, point.x, point.y));
	}

	override intersects(rect: Rectangle): boolean {
		return this.stroke.intersects(rect);
	}

	override moveByDelta(delta: Point): void {
		this.stroke.moveByDelta(delta);

		this.updateBoundsByDelta(delta);

		this.fireShapeEvent(new ShapeEvent(this, this.bounds));
	}

	override clone(): PenShape {
		const shape = new PenShape(this.handle, this.brush.clone());
		shape.stroke = this.stroke.clone();
		shape.bounds.set(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
		shape.setKeyEvent(this.getKeyEvent());
		shape.setSelected(this.isSelected());

		return shape;
	}

	public override getShapeType(): string {
		return "pen";
	}

	getPenStroke(): PenStroke {
		return this.stroke;
	}
}