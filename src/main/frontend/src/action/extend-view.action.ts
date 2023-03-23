import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { Rectangle } from "../geometry/rectangle";
import { ExtendViewTool } from "../tool/extend-view.tool";
import { ActionType } from "./action-type";

export class ExtendViewAction extends Action {

	private readonly rect: Rectangle;


	constructor(rect: Rectangle) {
		super();

		this.rect = rect;
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.selectAndExecuteTool(new ExtendViewTool(this.rect));
	}

	getActionType(): ActionType {
		return ActionType.EXTEND_VIEW;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(32);

		dataView.setFloat64(13, this.rect.x);
		dataView.setFloat64(21, this.rect.y);
		dataView.setFloat64(29, this.rect.width);
		dataView.setFloat64(37, this.rect.height);

		return buffer;
	}
}