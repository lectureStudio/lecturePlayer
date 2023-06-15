import { Page } from "./page";
import { SlideDocument } from "./document";

export class WhiteboardDocument extends SlideDocument {

	constructor() {
		super();

		this.loadPages()
	}

	private loadPages(): void {
		this.pages = [];

		for (let i = 0; i < 300; i++) {
			this.pages.push(new Page(this, null, i));
		}
	}
}