import { ActionExecutor } from "./action-executor";
import { ExecutableBase } from "../utils/executable-base";

abstract class ActionPlayer extends ExecutableBase {

	protected readonly executor: ActionExecutor;


	constructor(executor: ActionExecutor) {
		super();

		this.executor = executor;
	}



	abstract seekByTime(time: number): number;

	abstract seekByPage(pageNumber: number): number;

	protected abstract executeActions(): void;

}

export { ActionPlayer };