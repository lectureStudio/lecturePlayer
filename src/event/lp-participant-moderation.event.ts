import {CourseParticipantModeration} from "../model/moderation";

export type LpParticipantModerationEvent = CustomEvent<CourseParticipantModeration>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-moderation": LpParticipantModerationEvent;
	}
}
