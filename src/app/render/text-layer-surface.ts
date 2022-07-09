import { Page } from "../model/page";
import { Dimension } from "../geometry/dimension";

class TextLayerSurface {

	private readonly root: HTMLElement;

	private size: Dimension;


	constructor(root: HTMLElement) {
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
}

export { TextLayerSurface };