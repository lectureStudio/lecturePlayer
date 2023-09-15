import { ShapeRenderer } from "./shape.renderer";
import { Rectangle } from "../geometry/rectangle";
import { PenShape } from "../model/shape/pen.shape";

class PenRenderer implements ShapeRenderer {

	render(context: CanvasRenderingContext2D, shape: PenShape, _dirtyRegion: Rectangle): void {
		const stroke = shape.getPenStroke();
		const points = stroke.getStrokeList();
		const pointCount = points.length;

		if (pointCount < 1) {
			return;
		}

		const brush = shape.brush;
		const color = shape.isSelected() ? "rgb(255, 0, 100)" : brush.color.toRgb();

		let index = 0;
		let point = points[index++];

		context.beginPath();
		context.fillStyle = color;
		context.beginPath();
		context.moveTo(point.x, point.y);

		for (; index < pointCount;) {
			point = points[index++];

			if (index < pointCount) {
				context.lineTo(point.x, point.y);
			}
		}

		context.fill();
	}
}

export { PenRenderer };