import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { LatexTool } from "../tool/latex.tool";
import { ActionType } from "./action-type";

export class LatexAction extends Action {

	private readonly handle: number;


	constructor(handle: number) {
		super();

		this.handle = handle;
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new LatexTool(this.handle));
	}

	getActionType(): ActionType {
		return ActionType.LATEX;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(4);

		dataView.setInt32(13, this.handle);

		return buffer;
	}
}