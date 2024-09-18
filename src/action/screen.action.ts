import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";

class ScreenAction extends Action {

	execute(_executor: ActionExecutor): void {
		// Ignore. Rendering will take place in other components, e.g., VideoReader.
	}

	public override getActionType(): ActionType {
		return ActionType.SCREEN;
	}

	public override toBuffer(): ArrayBuffer {
		const dataLength = 0;
		const { buffer } = super.createBuffer(12 + dataLength);

		return buffer;
	}

}

export { ScreenAction };
