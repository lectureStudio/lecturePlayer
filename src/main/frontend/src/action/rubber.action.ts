import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { DeleteShapeTool } from "../tool/delete.shape.tool";
import { PenPoint } from "../geometry/pen-point";
import { ActionType } from "./action-type";

export class RubberAction extends Action {

	private shapeHandle: number;


	constructor(shapeHandle: number) {
		super();

		this.shapeHandle = shapeHandle;
	}

	execute(executor: ActionExecutor): void {
		executor.setKeyEvent(this.keyEvent);
		executor.setTool(new DeleteShapeTool(this.shapeHandle));
		executor.beginTool(new PenPoint(0, 0, 0));
	}

	getActionType(): ActionType {
		return ActionType.RUBBER_EXT;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(4);

		dataView.setInt32(13, this.shapeHandle);

		return buffer;
	}
}