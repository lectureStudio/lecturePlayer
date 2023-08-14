import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { TextTool } from "../tool/text.tool";
import { ActionType } from "./action-type";

export class TextAction extends Action {

	private readonly handle: number;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new TextTool(this.handle));
	}

	getActionType(): ActionType {
		return ActionType.TEXT;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(4);

		dataView.setInt32(13, this.handle);

		return buffer;
	}
}