import { ShapeRenderer } from "./shape.renderer";
import { TextShape } from "../model/shape/text.shape";
import { Rectangle } from "../geometry/rectangle";
import { Font } from "../paint/font";

class TextRenderer implements ShapeRenderer {

	render(context: CanvasRenderingContext2D, shape: TextShape, dirtyRegion: Rectangle): void {
		const text = shape.getText();

		if (!text || text.length === 0) {
			return;
		}

		const bounds = shape.bounds;
		const font = shape.getFont();
		const color = shape.getTextColor();
		const underline = shape.isUnderline();
		const strikethrough = shape.isStrikethrough();

		const transform = context.getTransformExt();
		const scale = transform.getScaleX();

		/*
		 * Render with identity transform and scaled font, since normalized
		 * font size won't give us the desired result as the text will be
		 * misplaced and missized.
		 */
		const scaledHeight = font.size * scale;
		const x = transform.getTranslateX() + bounds.x * scale;
		const y = transform.getTranslateY() + bounds.y * scale;

		const scaledFont = new Font(font.family, scaledHeight, font.style, font.weight);

		context.setTransform(1, 0, 0, 1, 0, 0);
		context.font = scaledFont.toString();
		context.fillStyle = color.toRgba();

		this.fillTextMultiLine(context, text, x, y, scaledHeight, underline, strikethrough);
	}

	fillTextMultiLine(context: CanvasRenderingContext2D, text: string, x: number, y: number, lineHeight: number, underline: boolean, strikethrough: boolean) {
		const lines = text.split("\n");

		if (lines.length > 0) {
			const metrics = context.measureText("Xg");

			y += metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
		}

		for (var i = 0; i < lines.length; ++i) {
			context.fillText(lines[i], x, y);

			if (underline || strikethrough) {
				this.drawAttributes(context, lines[i], x, y, lineHeight, underline, strikethrough);
			}

			y += lineHeight;
		}
	}

	drawAttributes(context: CanvasRenderingContext2D, text: string, x: number, y: number, textSize: number, underline: boolean, strikethrough: boolean) {
		const textWidth = context.measureText(text).width;

		const startX = x;
		const endX = x + textWidth;

		let startY = y + (textSize / 16);
		let lineHeight = textSize / 16;

		if (lineHeight < 1) {
			lineHeight = 1;
		}

		if (underline) {
			context.beginPath();
			context.strokeStyle = context.fillStyle;
			context.lineWidth = lineHeight;
			context.moveTo(startX, startY);
			context.lineTo(endX, startY);
			context.stroke();
		}
		if (strikethrough) {
			startY = y - (textSize / 4);

			context.beginPath();
			context.strokeStyle = context.fillStyle;
			context.lineWidth = lineHeight;
			context.moveTo(startX, startY);
			context.lineTo(endX, startY);
			context.stroke();
		}
	}
}

export { TextRenderer };