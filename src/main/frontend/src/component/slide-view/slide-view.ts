import { LitElement, html } from 'lit';
import { customElement } from 'lit/decorators.js';
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


	firstUpdated() {
		const slideCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".slide-canvas");
		const actionCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".action-canvas");
		const volatileCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".volatile-canvas");
		const textLayer: HTMLCanvasElement = this.renderRoot.querySelector(".text-layer");

		this.slideRenderSurface = new SlideRenderSurface(slideCanvas);
		this.actionRenderSurface = new RenderSurface(actionCanvas);
		this.volatileRenderSurface = new RenderSurface(volatileCanvas);
		this.textLayerSurface = new TextLayerSurface(textLayer);

		new ResizeObserver(this.resize.bind(this)).observe(this);

		this.resize();
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
		const slideRatio = 4 / 3;
		let width = this.clientWidth;
		let height = this.clientHeight;
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