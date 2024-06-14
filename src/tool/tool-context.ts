import { Action } from "../action/action";
import { RenderController } from "../controller/render.controller";
import { Page } from "../model/page";

export class ToolContext {

	readonly renderController: RenderController | undefined;

	actionListener: (action: Action) => void;

	page: Page;

	pageNumber: number | undefined;

	keyEvent: KeyboardEvent;


	constructor(renderController?: RenderController) {
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
