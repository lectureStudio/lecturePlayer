import { Action } from "../action/action";
import { Page } from "../model/page";
import { RenderController } from "../render/render-controller";

export class ToolContext {

	readonly renderController: RenderController;

	actionListener: (action: Action) => void;

	page: Page;

	pageNumber: number;

	keyEvent: KeyboardEvent;


	constructor(renderController: RenderController) {
		this.renderController = renderController;
	}

	beginBulkRender(): void {
		if (this.renderController) {
			this.renderController.beginBulkRender();
		}
	}

	endBulkRender(): void {
		if (this.renderController) {
			this.renderController.endBulkRender();
		}
	}

	recordAction(action: Action): void {
		if (this.actionListener) {
			this.actionListener(action);
		}
	}
}