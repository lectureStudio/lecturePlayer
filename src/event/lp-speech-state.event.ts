export interface SpeechState {
	requestId: string;
	accepted: boolean;
}

export type LpSpeechStateEvent = CustomEvent<SpeechState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-speech-state": LpSpeechStateEvent;
	}
}