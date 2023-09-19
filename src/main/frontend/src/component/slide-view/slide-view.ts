import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { MouseListener } from '../../event/mouse-listener';
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

	@query(".volatile-canvas")
	volatileCanvas: HTMLCanvasElement;

	@query(".user-Ids")
	userIdContainer: HTMLElement;

	@property({ type: Boolean, reflect: true })
	textLayerEnabled: boolean = true;


	firstUpdated() {
		document.addEventListener("participant-active",(event:CustomEvent) => {
			let usrId = event.detail;
			let userSpan = this.userIdContainer.querySelector("#"+usrId);
			if(!userSpan){
				userSpan = document.createElement("span");
				userSpan.id = usrId;
				userSpan.className = "single-id";
				userSpan.textContent = usrId;
				this.userIdContainer.appendChild(userSpan);
				
			} 
		});

		document.addEventListener("participant-inactive",(event:CustomEvent)=>{
			let usrId = event.detail;
			let userSpan = this.userIdContainer.querySelector("#"+usrId);
			if(userSpan){
				this.userIdContainer.removeChild(userSpan);
			} 
		});

		const slideCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".slide-canvas");
		const actionCanvas: HTMLCanvasElement = this.renderRoot.querySelector(".action-canvas");
		const textLayer: HTMLCanvasElement = this.renderRoot.querySelector(".text-layer");

		this.slideRenderSurface = new SlideRenderSurface(this, slideCanvas);
		this.actionRenderSurface = new RenderSurface(this, actionCanvas);
		this.volatileRenderSurface = new RenderSurface(this, this.volatileCanvas);
		this.textLayerSurface = new TextLayerSurface(this, textLayer);

		this.renderController = new RenderController(this);

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

	setTextLayerEnabled(enabled: boolean) {
		this.textLayerEnabled = enabled;
	}

	addMouseListener(listener: MouseListener) {
		// Use the volatile canvas since it has the real page/slide dimension.
		listener.registerElement(this.volatileCanvas);
	}

	removeMouseListener(listener: MouseListener) {
		// Use the volatile canvas since it has the real page/slide dimension.
		listener.unregisterElement(this.volatileCanvas);
	}

	private resize() {
		if (!this.renderController || !this.renderController.getPage()) {
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

			this.userIdContainer.style.width = width + "px";
			this.userIdContainer.style.height = height + "px";
		});
	}

	protected render() {
		return html`
			<canvas class="slide-canvas"></canvas>
			<canvas class="action-canvas" scale="full"></canvas>
			<canvas class="volatile-canvas" scale="full"></canvas>
			<div class="text-layer"></div>
			<div class="user-Ids"></div>
		`;
	}
}