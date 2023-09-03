export type LpFullscreenEvent = CustomEvent<boolean>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-fullscreen": LpFullscreenEvent;
	}
}