import { ActionExecutor } from "./action-executor";

export abstract class ActionPlayer {

	protected readonly executor: ActionExecutor;


	constructor(executor: ActionExecutor) {
		this.executor = executor;
	}



	abstract seekByTime(time: number): number;

	abstract seekByPage(pageNumber: number): number;

	protected abstract executeActions(): void;

}