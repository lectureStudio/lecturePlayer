export type LpParticipantJoinedEvent = CustomEvent<VideoRoomParticipant>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-joined": LpParticipantJoinedEvent;
	}
}