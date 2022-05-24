import { ActionPlayer } from "./action-player";
import { ActionExecutor } from "./action-executor";
import { SyncState } from "../utils/sync-state";
import { Action } from "./action";
import { SlideDocument } from "../model/document";

class StreamActionPlayer extends ActionPlayer {

	private readonly syncState: SyncState;

	private actions: Action[];

	private requestID: number;


	constructor(executor: ActionExecutor, syncState: SyncState) {
		super(executor);

		this.syncState = syncState;
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
			const time = this.syncState.audioTime;

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

	protected initInternal(): void {
		this.actions = [];
	}

	protected startInternal(): void {
		try {
			this.run();
		}
		catch (e) {
			console.error(e);

			throw new Error("Execute action failed.");
		}
	}

	protected stopInternal(): void {
		cancelAnimationFrame(this.requestID);
	}

	protected suspendInternal(): void {
		cancelAnimationFrame(this.requestID);
	}

	protected destroyInternal(): void {
		this.actions.length = 0;
	}

	private run() {
		this.executeActions();

		this.requestID = requestAnimationFrame(this.run.bind(this));
	}

}

export { StreamActionPlayer };