export type LpStreamConnectionStateEvent = CustomEvent<RTCPeerConnectionState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-stream-connection-state": LpStreamConnectionStateEvent;
	}
}