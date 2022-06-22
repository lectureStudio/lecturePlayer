import { Rectangle } from "../geometry/rectangle";
import { RenderSurface } from "./render-surface";
import { SlideRenderer } from "./slide.renderer";
import { SlideShape } from "../model/shape/slide.shape";

class SlideRenderSurface extends RenderSurface {

	renderSlideShape(shape: SlideShape, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		if (!this.canvasContext.canvas.style.width || !this.canvasContext.canvas.style.height) {
			return new Promise((resolve, reject) => {
				reject("Canvas has no real size");
			});
		}
		
		const renderer = <SlideRenderer> this.renderers.get(shape.constructor.name);
		let promise: Promise<CanvasImageSource> = null;

		if (renderer) {
			const pageRect = shape.bounds;

			const sx = this.canvas.width / pageRect.width;

			this.canvasContext.save();
			this.canvasContext.scale(sx, sx);

			promise = renderer.render(this.canvasContext, shape, dirtyRegion);

			this.canvasContext.restore();
		}

		return promise;
	}
}

export { SlideRenderSurface };