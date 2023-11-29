import { QuizFeature } from "../model/course-feature";
import { CourseFeatureState } from "../model/course-state";

export interface QuizState extends CourseFeatureState<QuizFeature> {

}

export type LpQuizStateEvent = CustomEvent<QuizState>;

declare global {
	interface GlobalEventHandlersEventMap {
		"lp-quiz-state": LpQuizStateEvent;
	}
}