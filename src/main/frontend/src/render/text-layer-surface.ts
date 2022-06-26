import { Page } from "../model/page";
import { Dimension } from "../geometry/dimension";
import { Rectangle } from "../geometry/rectangle";

class TextLayerSurface {

	protected readonly parent: HTMLElement;

	private readonly root: HTMLElement;

	private size: Dimension;


	constructor(parent: HTMLElement, root: HTMLElement) {
		this.parent = parent;
		this.root = root;
	}

	clear(): void {
		while (this.root.firstChild) {
			this.root.removeChild(this.root.firstChild);
		}
	}

	async render(page: Page) {
		this.clear();

		page.renderText(this.root, this.size);
	}

	getSize(): Dimension {
		return this.size;
	}

	setSize(width: number, height: number): void {
		this.size = new Dimension(width, height);

		this.root.style.width = width + "px";
		this.root.style.height = height + "px";
	}

	setPageSize(bounds: Rectangle): void {
		let width = this.parent.clientWidth;
		let height = this.parent.clientHeight;

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

		this.setSize(width, height);
	}
}

export { TextLayerSurface };