import { Page } from "../page";
import { Shape } from "./shape";
import { Rectangle } from "../../geometry/rectangle";
import { ShapeEvent } from "./shape-event";

export class SlideShape extends Shape {

	private readonly page: Page;


	constructor(page: Page) {
		super(0);

		this.page = page;

		this.updateBounds();
	}

	getPage(): Page {
		return this.page;
	}

	setPageRect(rect: Rectangle): void {
		if (this.bounds.equals(rect)) {
			return;
		}

		this.bounds.set(rect.x, rect.y, rect.width, rect.height);

		this.fireShapeEvent(new ShapeEvent(this, this.bounds));
	}

	public getShapeType(): string {
		return "slide";
	}

	protected updateBounds(): void {
		this.bounds.set(0, 0, 1, 1);
	}
}