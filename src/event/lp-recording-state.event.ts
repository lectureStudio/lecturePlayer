export interface RecordingState {
	courseId: number;
	recorded: boolean;
}

export type LpRecordingStateEvent = CustomEvent<RecordingState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-recording-state": LpRecordingStateEvent;
	}
}