import { JanusParticipant } from "../service/janus-participant";

export interface ParticipantConnectionState {
	participant: JanusParticipant,
	state: RTCPeerConnectionState
}

export type LpParticipantConnectionStateEvent = CustomEvent<ParticipantConnectionState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-participant-connection-state": LpParticipantConnectionStateEvent;
	}
}