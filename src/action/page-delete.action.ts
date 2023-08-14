import { Action } from "./action";
import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";

export class PageDeleteAction extends Action {

	private readonly documentId: bigint;

	private readonly pageNumber: number;


	constructor(pageNumber: number, documentId: bigint) {
		super();

		this.pageNumber = pageNumber;
		this.documentId = documentId;
	}

	execute(executor: ActionExecutor): void {
		executor.removePageNumber(this.pageNumber);
	}

	getActionType(): ActionType {
		return null;
	}

	toBuffer(): ArrayBuffer {
		return super.createBuffer(0).buffer;
	}
}