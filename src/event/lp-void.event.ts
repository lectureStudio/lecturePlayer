export type LpVoidEvent = CustomEvent<boolean>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-settings": LpVoidEvent;
		"lp-speech-canceled": LpVoidEvent;
		"lp-stream-statistics": LpVoidEvent;
		"lp-quiz-visibility": LpVoidEvent;
		"lp-chat-visibility": LpVoidEvent;
		"lp-participants-visibility": LpVoidEvent;
		"lp-receive-camera-feed": LpVoidEvent;
	}
}