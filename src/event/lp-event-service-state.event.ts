import { State } from "../utils/state";

export type LpEventServiceStateEvent = CustomEvent<State>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-event-service-state": LpEventServiceStateEvent;
	}
}