import { JanusParticipant } from "../service/janus-participant";

export type LpParticipantDestroyedEvent = CustomEvent<JanusParticipant>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-destroyed": LpParticipantDestroyedEvent;
	}
}