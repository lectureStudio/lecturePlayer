import { JanusParticipant } from "../service/janus-participant";

export interface ParticipantError {
	participant: JanusParticipant,
	cause: unknown
}

export type LpParticipantErrorEvent = CustomEvent<ParticipantError>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-error": LpParticipantErrorEvent;
	}
}