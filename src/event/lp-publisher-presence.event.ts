export type LpPublisherPresenceEvent = CustomEvent<PublisherPresence>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-publisher-presence": LpPublisherPresenceEvent;
	}
}