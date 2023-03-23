import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { TextChangeTool } from "../tool/text-change.tool";
import { ActionType } from "./action-type";

export class TextChangeAction extends Action {

	private readonly handle: number;

	private readonly text: string;


	constructor(handle: number, text: string) {
		super();

		this.handle = handle;
		this.text = text;
	}

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new TextChangeTool(this.handle, this.text));
	}

	getActionType(): ActionType {
		return ActionType.TEXT_CHANGE;
	}

	toBuffer(): ArrayBuffer {
		const encoder = new TextEncoder();
		const textBuffer = encoder.encode(this.text);

		const { buffer, dataView } = super.createBuffer(8 + textBuffer.length);

		dataView.setInt32(13, this.handle);
		dataView.setInt32(17, textBuffer.length);

		(<Uint8Array> buffer).set(textBuffer, 21);

		return buffer;
	}
}