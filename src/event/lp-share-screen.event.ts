export type LpShareScreenEvent = CustomEvent<MediaDeviceSetting>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-share-screen": LpShareScreenEvent;
	}
}