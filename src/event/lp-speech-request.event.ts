export type LpSpeechRequestEvent = CustomEvent<boolean>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-speech-request": LpSpeechRequestEvent;
	}
}