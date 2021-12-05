import { Rectangle } from "../geometry/rectangle";

class WhiteboardRenderer {

	async render(context: CanvasRenderingContext2D, viewRect: Rectangle, dirtyRegion: Rectangle): Promise<CanvasImageSource> {
		return new Promise((resolve) => {
			context.canvas.width = dirtyRegion.width;
			context.canvas.height = dirtyRegion.height;
			context.fillStyle = "white";
			context.fillRect(dirtyRegion.x, dirtyRegion.y, dirtyRegion.width, dirtyRegion.height);

			resolve(context.canvas);
		});
	}
}

export { WhiteboardRenderer };