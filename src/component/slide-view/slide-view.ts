import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { RenderController } from '../../render/render-controller';
import { RenderSurface } from '../../render/render-surface';
import { SlideRenderSurface, } from '../../render/slide-render-surface';
import { TextLayerSurface } from '../../render/text-layer-surface';
import { AnnotationLayerSurface } from '../../render/annotation-layer-surface';
import { Page } from '../../model/page';
import { Dimension } from '../../geometry/dimension';
import { MouseListener } from '../../event/mouse-listener';
import { autorun } from 'mobx';
import { ToolType } from '../../tool/tool';
import { toolStore } from '../../store/tool.store';
import { PlayerController } from '../player/player.controller';
import { uiStateStore } from '../../store/ui-state.store';
import slideViewStyles from './slide-view.scss';
import textLayerStyles from './text-layer.scss';
import annotationLayerStyles from './annotation-layer.scss';

@customElement('slide-view')
export class SlideView extends LitElement {

	static override styles = [
		slideViewStyles,
		textLayerStyles,
		annotationLayerStyles
	];

	playerController: PlayerController;

	private slideRenderSurface: SlideRenderSurface;

	private actionRenderSurface: RenderSurface;

	private volatileRenderSurface: RenderSurface;

	private textLayerSurface: TextLayerSurface;

	private annotationLayerSurface: AnnotationLayerSurface;

	private renderController: RenderController;

	private scale: number = 1;

	@query('.slide-container')
	private container: HTMLElement;

	@query(".volatile-canvas")
	private volatileCanvas: HTMLCanvasElement;

	@property({ type: Boolean, reflect: true })
	textLayerEnabled: boolean = true;


	override firstUpdated() {
		const slideCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".slide-canvas");
		const actionCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".action-canvas");
		const volatileCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".volatile-canvas");
		const textLayer: HTMLDivElement = this.renderRoot.querySelector(".text-layer");
		const annotationLayer: HTMLDivElement = this.renderRoot.querySelector(".annotation-layer");

		this.slideRenderSurface = new SlideRenderSurface(slideCanvas);
		this.actionRenderSurface = new RenderSurface(actionCanvas);
		this.volatileRenderSurface = new RenderSurface(volatileCanvas);
		this.textLayerSurface = new TextLayerSurface(textLayer);
		this.annotationLayerSurface = new AnnotationLayerSurface(annotationLayer);

		new ResizeObserver(this.resize.bind(this)).observe(this);

		this.playerController.setSlideView(this);

		autorun(() => {
			this.setSelectedTool(toolStore.selectedToolType);
		});

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

	addMouseListener(listener: MouseListener) {
		// Use the volatile canvas since it has the real page/slide dimension.
		listener.registerElement(this.volatileCanvas);
	}

	removeMouseListener(listener: MouseListener) {
		// Use the volatile canvas since it has the real page/slide dimension.
		listener.unregisterElement(this.volatileCanvas);
	}

	updateSurfaceSize() {
		this.resize();
	}

	protected override render() {
		return html`
			<div class="slide-container">
				<canvas class="slide-canvas"></canvas>
				<canvas class="action-canvas"></canvas>
				<canvas class="volatile-canvas"></canvas>
				<div class="text-layer"></div>
				<div class="annotation-layer"></div>
			</div>
		`;
	}

	private resize() {
		if (!this.renderController || !this.renderController.getPage()) {
			return;
		}

		const page = this.renderController.getPage();
		const bounds = page.getPageBounds();
		const size = this.getViewSize(page);

		if (!size) {
			return;
		}

		this.scale = size.width / bounds.width;

		this.style.setProperty('--scale-factor', this.scale.toString());

		this.setLayerDimensions(this.container, bounds.width, bounds.height);

		this.slideRenderSurface.setSize(size.width, size.height);
		this.actionRenderSurface.setSize(size.width, size.height);
		this.volatileRenderSurface.setSize(size.width, size.height);

		uiStateStore.setSlideSurfaceSize(this.slideRenderSurface.getSize());

		this.renderController.render();
	}

	private getViewSize(page: Page) {
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
			return null;
		}

		const pixelRatio = window.devicePixelRatio || 1;
		const sfx = this.approximateFraction(pixelRatio);

		width = this.roundToDivide(width, sfx[1]);
		height = this.roundToDivide(height, sfx[1]);

		return new Dimension(width, height);
	}

	private setLayerDimensions(div: HTMLElement, pageWidth: number, pageHeight: number) {
		const { style } = div;

		style.width = `calc(var(--scale-factor) * ${pageWidth}px)`;
		style.height = `calc(var(--scale-factor) * ${pageHeight}px)`;
	}

	private setSelectedTool(type: ToolType) {
		this.textLayerEnabled = (type === ToolType.CURSOR);
	}

	private roundToDivide(x: number, div: number) {
		const r = x % div;
		return r === 0 ? x : Math.round(x - r + div);
	}

	/**
	 * Approximates float number as a fraction using Farey sequence (max order
	 * of 8).
	 * @param {number} x - Positive float number.
	 * @returns {Array} Estimated fraction: the first array item is a numerator,
	 *                  the second one is a denominator.
	 */
	private approximateFraction(x: number) {
		// Fast paths for int numbers or their inversions.
		if (Math.floor(x) === x) {
			return [x, 1];
		}
		const xinv = 1 / x;
		const limit = 8;
		if (xinv > limit) {
			return [1, limit];
		} else if (Math.floor(xinv) === xinv) {
			return [1, xinv];
		}

		const x_ = x > 1 ? xinv : x;
		// a/b and c/d are neighbours in Farey sequence.
		let a = 0,
			b = 1,
			c = 1,
			d = 1;
		// Limiting search to order 8.
		while (true) {
			// Generating next term in sequence (order of q).
			const p = a + c,
				q = b + d;
			if (q > limit) {
				break;
			}
			if (x_ <= p / q) {
				c = p;
				d = q;
			} else {
				a = p;
				b = q;
			}
		}
		
		let result;

		// Select closest of the neighbours to x.
		if (x_ - a / b < c / d - x_) {
			result = x_ === x ? [a, b] : [b, a];
		}
		else {
			result = x_ === x ? [c, d] : [d, c];
		}
		return result;
	}
}