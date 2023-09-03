import { CourseParticipantPresence } from "../model/participant";

export type LpParticipantPresenceEvent = CustomEvent<CourseParticipantPresence>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-presence": LpParticipantPresenceEvent;
	}
}