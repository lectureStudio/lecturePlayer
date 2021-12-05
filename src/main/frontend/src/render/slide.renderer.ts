import { ShapeRenderer } from "./shape.renderer";
import { Rectangle } from "../geometry/rectangle";
import { SlideShape } from "../model/shape/slide.shape";

class SlideRenderer implements ShapeRenderer {

	async render(context: CanvasRenderingContext2D, shape: SlideShape, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		const page = shape.getPage();

		return page.render(context, shape.bounds, dirtyRegion);
	}
}

export { SlideRenderer };