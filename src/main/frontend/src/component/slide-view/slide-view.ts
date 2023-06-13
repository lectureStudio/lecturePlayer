import { LitElement, html } from 'lit';
import { customElement, query } from 'lit/decorators.js';
import { RenderController } from '../../render/render-controller';
import { RenderSurface } from '../../render/render-surface';
import { SlideRenderSurface, } from '../../render/slide-render-surface';
import { TextLayerSurface } from '../../render/text-layer-surface';
import { AnnotationLayerSurface } from '../../render/annotation-layer-surface';
import { slideViewStyles } from './slide-view.styles';
import { textLayerStyles } from './text-layer.styles';
import { annotationLayerStyles } from './annotation-layer.styles';

@customElement('slide-view')
export class SlideView extends LitElement {

	static styles = [
		slideViewStyles,
		textLayerStyles,
		annotationLayerStyles
	];

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private annotationLayerSurface: AnnotationLayerSurface;

	private renderController: RenderController;

	private scale: number = 1;

	@query('.slide-container')
	private container: HTMLElement;


	firstUpdated() {
		const slideCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".slide-canvas");
		const actionCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".action-canvas");
		const volatileCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".volatile-canvas");
		const textLayer: HTMLDivElement = this.renderRoot.querySelector(".text-layer");
		const annotationLayer: HTMLDivElement = this.renderRoot.querySelector(".annotation-layer");

		this.slideRenderSurface = new SlideRenderSurface(this, slideCanvas);
		this.actionRenderSurface = new RenderSurface(this, actionCanvas);
		this.volatileRenderSurface = new RenderSurface(this, volatileCanvas);
		this.textLayerSurface = new TextLayerSurface(textLayer);
		this.annotationLayerSurface = new AnnotationLayerSurface(annotationLayer);

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

	getAnnotationLayerSurface(): AnnotationLayerSurface {
		return this.annotationLayerSurface;
	}

	private resize() {
		if (!this.renderController) {
			return;
		}

		const page = this.renderController.getPage();
		const bounds = page.getPageBounds();

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

		this.scale = (1.0 / page.getSlideShape().bounds.width) * (width / bounds.width);

		this.style.setProperty('--scale-factor', this.scale.toString());

		this.setLayerDimensions(this.container, bounds.width, bounds.height);

		this.slideRenderSurface.setSize(width, height);
		this.actionRenderSurface.setSize(width, height);
		this.volatileRenderSurface.setSize(width, height);
	}

	render() {
		return html`
			<div class="slide-container">
				<canvas class="slide-canvas"></canvas>
				<canvas class="action-canvas" scale="full"></canvas>
				<canvas class="volatile-canvas" scale="full"></canvas>
				<div class="text-layer"></div>
				<div class="annotation-layer"></div>
			</div>
		`;
	}

	private setLayerDimensions(div: HTMLElement, pageWidth: number, pageHeight: number) {
		const { style } = div;

		style.width = `calc(var(--scale-factor) * ${pageWidth}px)`;
		style.height = `calc(var(--scale-factor) * ${pageHeight}px)`;
	}
}