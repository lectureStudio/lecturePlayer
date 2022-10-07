import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
import { RenderController } from '../../render/render-controller';
import { RenderSurface } from '../../render/render-surface';
import { SlideRenderSurface, } from '../../render/slide-render-surface';
import { TextLayerSurface } from '../../render/text-layer-surface';
import { slideViewStyles } from './slide-view.styles';

@customElement('slide-view')
export class SlideView extends LitElement {

	static styles = [
		slideViewStyles,
	];

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private renderController: RenderController;


	firstUpdated() {
		const slideCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".slide-canvas");
		const actionCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".action-canvas");
		const volatileCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".volatile-canvas");
		const textLayer: HTMLCanvasElement = this.renderRoot.querySelector(".text-layer");

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

	render() {
		return html`
			<canvas class="slide-canvas"></canvas>
			<canvas class="action-canvas" scale="full"></canvas>
			<canvas class="volatile-canvas" scale="full"></canvas>
			<div class="text-layer"></div>
		`;
	}

}