import { Shape } from "../model/shape/shape";
import { ShapeRenderer } from "./shape.renderer";
import { Dimension } from "../geometry/dimension";
import { Rectangle } from "../geometry/rectangle";
import { Transform } from "../geometry/transform";

export class RenderSurface {

	protected readonly canvas: HTMLCanvasElement;

	protected readonly canvasContext: CanvasRenderingContext2D;

	protected readonly renderers: Map<String, ShapeRenderer>;

	private readonly transform: Transform;

	private size: Dimension = new Dimension(0, 0);


	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.canvasContext = canvas.getContext("2d");
		this.renderers = new Map();
		this.transform = new Transform();
	}

	clear(): void {
		this.canvasContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	registerRenderer(shape: Shape, render: ShapeRenderer): void {
		this.renderers.set(shape.getShapeType(), render);
	}

	renderImageSource(canvas: CanvasImageSource): void {
		this.canvasContext.drawImage(canvas, 0, 0);
	}

	renderSurface(surface: RenderSurface): void {
		if (surface.canvas.width === 0 || surface.canvas.height === 0) {
			return;
		}

		this.canvasContext.drawImage(surface.canvas, 0, 0);
	}

	renderShapes(shapes: Shape[]): void {
		for (let shape of shapes) {
			this.renderShape(shape, null);
		}
	}

	renderShape(shape: Shape, dirtyRegion: Rectangle): void {
		const renderer = this.renderers.get(shape.getShapeType());

		if (renderer) {
			const s = this.canvas.width * this.transform.getScaleX();
			const tx = this.transform.getTranslateX();
			const ty = this.transform.getTranslateY();

			this.canvasContext.save();
			this.canvasContext.scale(s, s);
			this.canvasContext.translate(-tx, -ty);

			renderer.render(this.canvasContext, shape, dirtyRegion);

			this.canvasContext.restore();
		}
	}

	getSize(): Dimension {
		return this.size;
	}

	setSize(width: number, height: number): void {
		if (width <= 1 || height <= 1) {
			return;
		}

		// HiDPI handling
		const dpr = window.devicePixelRatio || 1;
		const newSize = new Dimension(width * dpr, height * dpr);

		if (newSize.equals(this.size)) {
			return;
		}

		this.size = newSize;

		this.resizeCanvas(width, height, dpr);
	}

	setCanvasSize(width: number, height: number) {
		this.canvas.width = width;
		this.canvas.height = height;
	}

	setTransform(transform: Transform): void {
		this.transform.setTransform(transform);
	}

	private resizeCanvas(width: number, height: number, devicePixelRatio: number): void {
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";
	}
}