import { MessageFeature } from "../model/course-feature";
import { CourseFeatureState } from "../model/course-state";

export interface ChatState extends CourseFeatureState<MessageFeature> {

}

export type LpChatStateEvent = CustomEvent<ChatState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-chat-state": LpChatStateEvent;
	}
}