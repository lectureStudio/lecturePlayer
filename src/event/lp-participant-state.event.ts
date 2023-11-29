import { JanusParticipant } from "../service/janus-participant";
import { State } from "../utils/state";

export interface ParticipantState {
	participant: JanusParticipant,
	state: State
}

export type LpParticipantStateEvent = CustomEvent<ParticipantState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-state": LpParticipantStateEvent;
	}
}