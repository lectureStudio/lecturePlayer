import { PageEvent, PageChangeType } from "../model/page-event";
import { RenderSurface } from "./render-surface";
import { TextLayerSurface } from "./text-layer-surface";
import { StrokeShape } from "../model/shape/stroke.shape";
import { HighlighterRenderer } from "./highlighter.renderer";
import { Rectangle } from "../geometry/rectangle";
import { Page } from "../model/page";
import { PointerRenderer } from "./pointer.renderer";
import { ArrowRenderer } from "./arrow.renderer";
import { RectangleRenderer } from "./rectangle.renderer";
import { LineRenderer } from "./line.renderer";
import { EllipseRenderer } from "./ellipse.renderer";
import { PointerShape } from "../model/shape/pointer.shape";
import { ArrowShape } from "../model/shape/arrow.shape";
import { RectangleShape } from "../model/shape/rectangle.shape";
import { LineShape } from "../model/shape/line.shape";
import { EllipseShape } from "../model/shape/ellipse.shape";
import { Shape } from "../model/shape/shape";
import { SelectShape } from "../model/shape/select.shape";
import { SelectRenderer } from "./select.renderer";
import { ZoomShape } from "../model/shape/zoom.shape";
import { ZoomRenderer } from "./zoom.renderer";
import { TextShape } from "../model/shape/text.shape";
import { TextRenderer } from "./text.renderer";
import { SlideRenderSurface } from "./slide-render-surface";
import { Transform } from "../geometry/transform";
import { TextHighlightShape } from "../model/shape/text-highlight.shape";
import { TextHighlightRenderer } from "./text-highlight.renderer";
import { LatexShape } from "../model/shape/latex.shape";
import { LatexRenderer } from "./latex.renderer";
import { PenShape } from "../model/shape/pen.shape";
import { PenRenderer } from "./pen.renderer";
import { Brush } from "../paint/brush";
import { SlideView } from "../component/slide-view/slide-view";
import { AnnotationLayerSurface } from "./annotation-layer-surface";

export class RenderController {

	private readonly pageChangeListener: (event: PageEvent) => void;

	private readonly visibilityChangeListener: () => void;

	private slideView: SlideView;

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private annotationLayerSurface: AnnotationLayerSurface;

	private page: Page;

	private lastShape: Shape;

	private lastTransform: Transform;

	private seek: boolean = false;

	private rendering: boolean = false;


	constructor() {
		this.lastTransform = new Transform();

		this.pageChangeListener = this.pageChanged.bind(this);
		this.visibilityChangeListener = this.visibilityChanged.bind(this);

		document.addEventListener("visibilitychange", this.visibilityChangeListener);
	}

	setSlideView(slideView: SlideView) {
		this.slideView = slideView;
		this.slideView.setRenderController(this);

		this.slideRenderSurface = slideView.getSlideRenderSurface();
		this.actionRenderSurface = slideView.getActionRenderSurface();
		this.volatileRenderSurface = slideView.getVolatileRenderSurface();
		this.textLayerSurface = slideView.getTextLayerSurface();
		this.annotationLayerSurface = slideView.getAnnotationLayerSurface();

		this.registerShapeRenderers(this.actionRenderSurface);
		this.registerShapeRenderers(this.volatileRenderSurface);
	}

	getPage(): Page {
		return this.page;
	}

	setPage(page: Page): void {
		if (this.page) {
			// Disable rendering for previous page.
			this.disableRendering();
		}

		this.page = page;

		if (!this.seek) {
			this.enableRendering();
		}

		if (!this.slideView) {
			return;
		}

		this.slideView.updateSurfaceSize();

		this.renderAllLayers(page);
	}

	setSeek(seek: boolean): void {
		this.seek = seek;

		if (seek) {
			this.disableRendering();
		}
		else {
			this.enableRendering();

			// Finished seeking step. Render current state.
			if (this.lastTransform.equals(this.getPageTransform())) {
				// Render slide and text layer only if we have to: see page transform.
				this.refreshAnnotationLayers();
			}
			else {
				// Page transform changed. Update all layers.
				this.renderAllLayers(this.page);
			}
		}
	}

	beginBulkRender(): void {
		if (!this.seek) {
			this.disableRendering();
		}
	}

	endBulkRender(): void {
		if (!this.seek) {
			this.refreshAnnotationLayers();
			this.enableRendering();
		}
	}

	render(): void {
		this.renderAllLayers(this.page);
	}

	dispose() {
		document.removeEventListener("visibilitychange", this.visibilityChangeListener);

		if (this.page) {
			this.page.removeChangeListener(this.pageChangeListener);
		}
	}

	private enableRendering(): void {
		this.page.addChangeListener(this.pageChangeListener);
	}

	private disableRendering(): void {
		this.page.removeChangeListener(this.pageChangeListener);
	}

	private pageChanged(event: PageEvent): void {
		switch (event.changeType) {
			case PageChangeType.PageTransform:
				this.renderAllLayers(this.page);
				break;

			case PageChangeType.Clear:
				this.clearAnnotationLayers();
				break;

			case PageChangeType.ShapeAdded:
				if (this.lastShape && this.lastShape != event.shape) {
					const size = this.actionRenderSurface.getSize();
					const bounds: Rectangle = new Rectangle(0, 0, size.width, size.height);

					this.renderPermanentLayer(this.lastShape, bounds);
				}

				this.renderVolatileLayer(event.shape, event.dirtyRegion);
				break;

			case PageChangeType.ShapeRemoved:
				this.refreshAnnotationLayers();
				break;

			case PageChangeType.ShapeModified:
				if (event.shape.getShapeType() === "text") {
					this.renderAllLayers(this.page);
				}
				else {
					this.renderVolatileLayer(event.shape, event.dirtyRegion);
				}
				break;
		}
	}

	private visibilityChanged(): void {
		if (document.visibilityState === "visible") {
			setTimeout(() => {
				window.dispatchEvent(new Event("resize"));

				this.renderAllLayers(this.page);
			}, 100);
		}
	}

	private clearAnnotationLayers(): void {
		this.volatileRenderSurface.clear();
		this.actionRenderSurface.renderSurface(this.slideRenderSurface);

		this.lastShape = null;
	}

	private refreshAnnotationLayers(): void {
		const shapes = this.page.getShapes();
		const lastIndex = shapes.length - 1;

		if (lastIndex >= 0) {
			// The page contains at least one shape.
			this.actionRenderSurface.renderSurface(this.slideRenderSurface);

			if (lastIndex > 0) {
				// Render all shapes except the last one on the permanent surface.
				this.actionRenderSurface.renderShapes(shapes.slice(0, lastIndex));
			}

			// Always render the last shape on the volatile surface.
			const lastShape = shapes[lastIndex];
			this.renderVolatileLayer(lastShape, lastShape.bounds);
		}
		else {
			// The page contains no shapes.
			this.volatileRenderSurface.clear();
			this.actionRenderSurface.renderSurface(this.slideRenderSurface);

			this.lastShape = null;
		}
	}

	private renderAllLayers(page: Page): void {
		if (this.rendering) {
			// Rendering too fast, skip. Happens especially while panning in zoomed mode.
			return;
		}

		const size = this.slideRenderSurface.getSize();

		if (!size || size.width === 0 || size.height === 0) {
			// Do not even try to render.
			return;
		}

		this.rendering = true;

		const transform = this.getSlideTransform();

		this.renderSlideLayer(page, transform).then(() => {
			if (!size || size.width === 0 || size.height === 0) {
				// Do not even try to render.
				return;
			}

			const pageTransform = this.getPageTransform();

			this.lastTransform.setTransform(pageTransform);

			this.actionRenderSurface.setTransform(pageTransform);
			this.actionRenderSurface.setCanvasSize(size.width, size.height);
			this.actionRenderSurface.renderSurface(this.slideRenderSurface);
			this.actionRenderSurface.renderShapes(page.getShapes());

			this.volatileRenderSurface.setTransform(pageTransform);
			this.volatileRenderSurface.setCanvasSize(size.width, size.height);
			this.volatileRenderSurface.clear();

			this.textLayerSurface.render(page, transform);
			this.annotationLayerSurface.render(page);

			this.lastShape = null;

			this.rendering = false;

			if (!Object.is(page, this.page)) {
				// Keep the view up to date.
				this.renderAllLayers(this.page);
			}
		});
	}

	private renderPermanentLayer(shape: Shape, dirtyRegion: Rectangle): void {
		this.actionRenderSurface.renderShape(shape, dirtyRegion);
	}

	private renderVolatileLayer(shape: Shape, dirtyRegion: Rectangle): void {
		this.volatileRenderSurface.renderSurface(this.actionRenderSurface);
		this.volatileRenderSurface.renderShape(shape, dirtyRegion);

		this.lastShape = shape;
	}

	private renderSlideLayer(page: Page, transform: Transform): Promise<void> {
		const size = this.slideRenderSurface.getSize();

		if (!size) {
			return Promise.reject("Surface has no real size");
		}

		const bounds = new Rectangle(0, 0, size.width, size.height);

		return this.slideRenderSurface.render(page, transform, bounds);
	}

	private getSlideTransform(): Transform {
		const size = this.slideRenderSurface.getSize();

		const viewRect = this.page.getSlideShape().bounds;
		const pageProxy = this.page.getPageProxy();

		const scaleX = 1.0 / viewRect.width;
		const scaleTx = size.width * scaleX;

		const tx = viewRect.x * scaleTx;
		const ty = viewRect.y * scaleTx;

		const width = pageProxy.view[2] - pageProxy.view[0];
		const scale = scaleX * (size.width / width);

		return new Transform([scale, 0, 0, scale, -tx, -ty]);
	}

	private getPageTransform(): Transform {
		const pageBounds = this.page.getSlideShape().bounds;

		const pageTransform = new Transform();
		pageTransform.translate(pageBounds.x, pageBounds.y);
		pageTransform.scale(1.0 / pageBounds.width, 1.0 / pageBounds.height);

		return pageTransform;
	}

	private registerShapeRenderers(renderSurface: RenderSurface): void {
		const brush = new Brush(null, null);

		renderSurface.registerRenderer(new PenShape(null, brush), new PenRenderer());
		renderSurface.registerRenderer(new StrokeShape(null, brush), new HighlighterRenderer());
		renderSurface.registerRenderer(new PointerShape(null, brush), new PointerRenderer());
		renderSurface.registerRenderer(new ArrowShape(null, brush), new ArrowRenderer());
		renderSurface.registerRenderer(new RectangleShape(null, brush), new RectangleRenderer());
		renderSurface.registerRenderer(new LineShape(null, brush), new LineRenderer());
		renderSurface.registerRenderer(new EllipseShape(null, brush), new EllipseRenderer());
		renderSurface.registerRenderer(new SelectShape(), new SelectRenderer());
		renderSurface.registerRenderer(new TextShape(null), new TextRenderer());
		renderSurface.registerRenderer(new TextHighlightShape(null, null), new TextHighlightRenderer());
		renderSurface.registerRenderer(new LatexShape(null), new LatexRenderer());
		renderSurface.registerRenderer(new ZoomShape(), new ZoomRenderer());
	}
}