import { Action } from "./action";

export class ActionHandler<T> {

	private undoActions: Action<T>[] = [];

	private redoActions: Action<T>[] = [];

	private model: T;


	constructor(model: T) {
		this.model = model;
	}

	executeAction(action: Action<T>): void {
		this.undoActions.push(action);
		this.redoActions.length = 0;

		action.execute(this.model);
	}

	undo(): void {
		if (this.undoActions.length < 1) {
			return;
		}

		const action = this.undoActions.pop();

		if (!action) {
			// This case should never be reached.
			throw new Error("No action to undo");
		}

		this.redoActions.push(action);
		action.undo(this.model);
	}

	redo(): void {
		if (this.redoActions.length < 1) {
			return;
		}

		const action = this.redoActions.pop();

		if (!action) {
			// This case should never be reached.
			throw new Error("No action to redo");
		}

		this.undoActions.push(action);
		action.redo(this.model);
	}

	clear(): void {
		this.undoActions.length = 0;
		this.redoActions.length = 0;
	}

	canUndo(): boolean {
		return this.undoActions.length > 0;
	}

	canRedo(): boolean {
		return this.redoActions.length > 0;
	}
}