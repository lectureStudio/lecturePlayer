import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { TextRemoveTool } from "../tool/text-remove.tool";
import { ActionType } from "./action-type";

export class TextRemoveAction extends Action {

	private readonly handle: number;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new TextRemoveTool(this.handle));
	}

	getActionType(): ActionType {
		return ActionType.TEXT_REMOVE;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(4);

		dataView.setInt32(13, this.handle);

		return buffer;
	}
}