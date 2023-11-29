import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { Point } from "../geometry/point";
import { TextMoveTool } from "../tool/text-move.tool";
import { ActionType } from "./action-type";

export class TextMoveAction extends Action {

	private readonly handle: number;

	private readonly point: Point;


	constructor(handle: number, point: Point) {
		super();

		this.handle = handle;
		this.point = point;
	}

	execute(executor: ActionExecutor): void {
		executor.selectAndExecuteTool(new TextMoveTool(this.handle, this.point));
	}

	getActionType(): ActionType {
		return ActionType.TEXT_LOCATION_CHANGE;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(20);

		dataView.setInt32(13, this.handle);
		dataView.setFloat64(17, this.point.x);
		dataView.setFloat64(25, this.point.y);

		return buffer;
	}
}