import { ActionPlayer } from "./action-player";
import { ActionExecutor } from "./action-executor";
import { Action } from "./action";
import { SlideDocument } from "../model/document";

export class StreamActionPlayer extends ActionPlayer {

	private actions: Action[];

	private requestID: number;


	constructor(executor: ActionExecutor) {
		super(executor);
	}

	start(): void {
		this.actions = [];

		try {
			this.run();
		}
		catch (e) {
			console.error(e);

			throw new Error("Execute action failed.");
		}
	}

	stop(): void {
		cancelAnimationFrame(this.requestID);
	}

	suspend(): void {
		cancelAnimationFrame(this.requestID);
	}

	destroy(): void {
		this.actions.length = 0;
	}

	addAction(action: Action): void {
		if (document.visibilityState === "hidden") {
			// Execute action with the current state.
			// Some browsers, mostly Chromium-based, get the state mixed-up when the player is not visible.
			try {
				action.execute(this.executor);
			}
			catch (cause) {
				console.error(cause);
			}
		}
		else {
			this.actions.push(action);
		}
	}

	setDocument(document: SlideDocument): void {
		this.executor.setDocument(document);
	}

	seekByTime(time: number): number {
		throw new Error("Method not implemented.");
	}

	seekByPage(pageNumber: number): number {
		throw new Error("Method not implemented.");
	}

	protected executeActions(): void {
		let actionCount = this.actions.length;

		while (actionCount > 0) {
			// Get next action for execution.
			const action = this.actions[0];

			// if (time >= action.timestamp) {
				//console.log("action latency: " + (time - action.timestamp));

				try {
					action.execute(this.executor);
				}
				catch (cause) {
					//console.error(cause);
				}

				// Remove executed action.
				this.actions.shift();

				actionCount = this.actions.length;
			// }
			// else {
			// 	break;
			// }
		}
	}

	private run() {
		this.executeActions();

		this.requestID = requestAnimationFrame(this.run.bind(this));
	}
}