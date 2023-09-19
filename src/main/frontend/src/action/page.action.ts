import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";

export class PageAction extends Action {

	private readonly pageNumber: number;


	constructor(pageNumber: number) {
		super();

		this.pageNumber = pageNumber;
	}

	execute(executor: ActionExecutor): void {
		executor.setPageNumber(this.pageNumber);
	}

	getActionType(): ActionType {
		return ActionType.PAGE;
	}

	toBuffer(): ArrayBuffer {
		const { buffer, dataView } = super.createBuffer(12);

		dataView.setBigInt64(13, BigInt(0));
		dataView.setInt32(21, this.pageNumber);

		return buffer;
	}

	getPageNumber():number{
		return this.pageNumber;
	}
}