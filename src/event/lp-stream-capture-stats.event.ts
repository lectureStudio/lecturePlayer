export type LpStreamCaptureStatsEvent = CustomEvent<boolean>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-stream-capture-stats": LpStreamCaptureStatsEvent;
	}
}