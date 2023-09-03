export type LpDeviceChangeEvent = CustomEvent<MediaDeviceSetting>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-device-change": LpDeviceChangeEvent;
	}
}