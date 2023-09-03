export type LpDeviceMuteEvent = CustomEvent<MediaDeviceSetting>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-device-mute": LpDeviceMuteEvent;
	}
}