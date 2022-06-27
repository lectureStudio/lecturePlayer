import { PageEvent, PageChangeType } from "../model/page-event";
import { RenderSurface } from "./render-surface";
import { TextLayerSurface } from "./text-layer-surface";
import { StrokeShape } from "../model/shape/stroke.shape";
import { HighlighterRenderer } from "./highlighter.renderer";
import { SizeEvent } from "../event/size-event";
import { SlideShape } from "../model/shape/slide.shape";
import { SlideRenderer } from "./slide.renderer";
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

export class RenderController {

	private readonly pageChangeListener: (event: PageEvent) => void;

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private page: Page;

	private lastShape: Shape;

	private lastTransform: Transform;

	private seek: boolean = false;


	constructor() {
		this.pageChangeListener = this.pageChanged.bind(this);
		this.lastTransform = new Transform();

		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") {
				setTimeout(() => {
					window.dispatchEvent(new Event("resize"));
	
					this.renderAllLayers(this.page);
				}, 100);
			}
		});
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

		this.updateSurfaceSize(page)
			.then(() => {
				if (!this.seek) {
					this.enableRendering();
				}

				this.renderAllLayers(page);
			})
			.catch(error => {
				console.error(error);
			});
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

	setSlideRenderSurface(renderSurface: SlideRenderSurface): void {
		this.slideRenderSurface = renderSurface;
		this.slideRenderSurface.registerRenderer(new SlideShape(null), new SlideRenderer());
		this.slideRenderSurface.addSizeListener(this.slideRenderSurfaceSizeChanged.bind(this));
	}

	setActionRenderSurface(renderSurface: RenderSurface): void {
		this.actionRenderSurface = renderSurface;
		this.actionRenderSurface.addSizeListener(this.actionRenderSurfaceSizeChanged.bind(this));

		this.registerShapeRenderers(renderSurface);
	}

	setVolatileRenderSurface(renderSurface: RenderSurface): void {
		this.volatileRenderSurface = renderSurface;

		this.registerShapeRenderers(renderSurface);
	}

	setTextLayerSurface(textLayerSurface: TextLayerSurface): void {
		this.textLayerSurface = textLayerSurface;
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

	private updateSurfaceSize(page: Page): Promise<void> {
		return page.getPageBounds().then(bounds => {
			this.slideRenderSurface.setPageSize(bounds);
			this.actionRenderSurface.setPageSize(bounds);
			this.volatileRenderSurface.setPageSize(bounds);
			this.textLayerSurface.setPageSize(bounds);
		});
	}

	private enableRendering(): void {
		this.page.addChangeListener(this.pageChangeListener);
	}

	private disableRendering(): void {
		this.page.removeChangeListener(this.pageChangeListener);
	}

	private slideRenderSurfaceSizeChanged(event: SizeEvent): void {
		this.renderAllLayers(this.page);
	}

	private actionRenderSurfaceSizeChanged(event: SizeEvent): void {
		this.refreshAnnotationLayers();
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
				this.renderVolatileLayer(event.shape, event.dirtyRegion);
				break;
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
		const size = this.slideRenderSurface.getSize();

		if (!size) {
			// Do not even try to render.
			return;
		}

		const promise = this.renderSlideLayer(page);
		promise.then((imageSource: CanvasImageSource) => {
			if (imageSource) {
				const pageTransform = this.getPageTransform();

				this.lastTransform.setTransform(pageTransform);

				this.actionRenderSurface.setTransform(pageTransform);
				this.volatileRenderSurface.setTransform(pageTransform);

				this.actionRenderSurface.renderImageSource(imageSource);
				this.actionRenderSurface.renderShapes(page.getShapes());
				this.volatileRenderSurface.clear();
				this.textLayerSurface.render(page);

				this.lastShape = null;

				if (!Object.is(page, this.page)) {
					// Keep the view up to date.
					this.renderAllLayers(this.page);
				}
			}
		})
		.catch(error => {
			console.error(error)
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

	private renderSlideLayer(page: Page): Promise<CanvasImageSource> {
		const size = this.slideRenderSurface.getSize();

		if (!size) {
			return this.slideRenderSurface.renderSlideShape(page.getSlideShape(), new Rectangle(0, 0, 0, 0));
		}

		const bounds = new Rectangle(0, 0, size.width, size.height);

		return this.slideRenderSurface.renderSlideShape(page.getSlideShape(), bounds);
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