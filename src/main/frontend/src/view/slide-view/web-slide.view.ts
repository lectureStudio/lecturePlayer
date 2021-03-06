import { SlideView } from "../../api/view/slide.view";
import { SlideRenderSurface } from "../../render/slide-render-surface";
import { RenderSurface } from "../../render/render-surface";
import { TextLayerSurface } from "../../render/text-layer-surface";
import { ViewElement } from "../view-element";
import { WebViewElement } from "../web-view-element";
import { RenderController } from "../../render/render-controller";

@ViewElement({
	selector: "slide-view",
	templateUrl: "web-slide.view.html",
	styleUrls: ["web-slide.view.css"]
})
class WebSlideView extends WebViewElement implements SlideView {

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private renderController: RenderController;


	constructor() {
		super();
	}

	connectedCallback() {
		const slideCanvas = this.querySelector<HTMLCanvasElement>('.slide-canvas');
		const actionCanvas = this.querySelector<HTMLCanvasElement>('.action-canvas');
		const volatileCanvas = this.querySelector<HTMLCanvasElement>('.volatile-canvas');
		const textLayer = this.querySelector<HTMLElement>('.text-layer');

		this.slideRenderSurface = new SlideRenderSurface(this, slideCanvas);
		this.actionRenderSurface = new RenderSurface(this, actionCanvas);
		this.volatileRenderSurface = new RenderSurface(this, volatileCanvas);
		this.textLayerSurface = new TextLayerSurface(this, textLayer);

		new ResizeObserver(this.resize.bind(this)).observe(this);

		this.resize();
	}

	setRenderController(renderController: RenderController): void {
		this.renderController = renderController;
	}

	getActionRenderSurface(): RenderSurface {
		return this.actionRenderSurface;
	}

	getSlideRenderSurface(): SlideRenderSurface {
		return this.slideRenderSurface;
	}

	getVolatileRenderSurface(): RenderSurface {
		return this.volatileRenderSurface;
	}

	getTextLayerSurface(): TextLayerSurface {
		return this.textLayerSurface;
	}

	repaint(): void {
		this.resize();
	}

	private resize() {
		if (!this.renderController) {
			return;
		}

		const page = this.renderController.getPage();
		page.getPageBounds().then(bounds => {
			let width = this.clientWidth;
			let height = this.clientHeight;

			const slideRatio = bounds.width / bounds.height;
			const viewRatio = width / height;

			if (viewRatio > slideRatio) {
				width = height * slideRatio;
			}
			else {
				height = width / slideRatio;
			}

			if (width === 0 || height === 0) {
				return;
			}

			this.slideRenderSurface.setSize(width, height);
			this.actionRenderSurface.setSize(width, height);
			this.volatileRenderSurface.setSize(width, height);
			this.textLayerSurface.setSize(width, height);
		});
	}
}

export { WebSlideView };