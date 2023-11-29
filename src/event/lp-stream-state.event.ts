export interface StreamState {
	courseId: number;
	started: boolean;
	timeStarted: number;
}

export type LpStreamStateEvent = CustomEvent<StreamState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-stream-state": LpStreamStateEvent;
	}
}