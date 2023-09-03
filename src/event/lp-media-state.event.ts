import { MediaStreamState } from "../model/event/queue-events";

export interface MediaState {
	userId: string;
	state: MediaStreamState;
}

export type LpMediaStateEvent = CustomEvent<MediaState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-media-state": LpMediaStateEvent;
	}
}