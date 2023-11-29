import { JanusParticipant } from "../service/janus-participant";

export interface ParticipantData {
	participant: JanusParticipant,
	data: ArrayBuffer | Blob
}

export type LpParticipantDataEvent = CustomEvent<ParticipantData>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-data": LpParticipantDataEvent;
	}
}