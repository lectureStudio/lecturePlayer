import { ShapeRenderer } from "./shape.renderer";
import { Rectangle } from "../geometry/rectangle";
import { Font } from "../paint/font";
import { LatexShape } from "../model/shape/latex.shape";

class LatexRenderer implements ShapeRenderer {

	render(context: CanvasRenderingContext2D, shape: LatexShape, _dirtyRegion: Rectangle): void {
		const text = shape.getText();

		if (!text || text.length === 0) {
			return;
		}

		const bounds = shape.bounds;
		const font = shape.getFont();

		const transform = context.getTransform();
		const scale = transform.a;

		/*
		 * Render with identity transform and scaled font, since normalized
		 * font size won't give us the desired result as the text will be
		 * misplaced and missized.
		 */
		const scaledHeight = font.size * scale;
		const x = transform.e + bounds.x * scale;
		const y = transform.f + bounds.y * scale;

		const scaledFont = new Font(font.family, scaledHeight, font.style, font.weight);

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.font = scaledFont.toString();
		context.fillStyle = shape.getTextColor().toRgba();
		context.fillText(text, x, y + scaledHeight);
	}
}

export { LatexRenderer };