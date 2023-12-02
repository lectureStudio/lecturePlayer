import { CourseFeatureResponse } from "../model/course-feature";

export type LpChatResponseEvent = CustomEvent<CourseFeatureResponse>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-chat-error": LpChatResponseEvent;
		"lp-chat-response": LpChatResponseEvent;
	}
}