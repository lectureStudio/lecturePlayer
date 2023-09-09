export type LpParticipantLeftEvent = CustomEvent<VideoRoomParticipant>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-left": LpParticipantLeftEvent;
	}
}