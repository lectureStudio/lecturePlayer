import { CourseStateDocument } from "./course-state-document";

export interface CourseFeature {

	readonly featureId: string

}

export interface MessageFeature extends CourseFeature {


}

export interface QuizFeature {

	

}

export interface CourseState {

	readonly documentMap: Map<bigint, CourseStateDocument>;

	readonly avtiveDocument: CourseStateDocument;

	readonly timeStarted: number;
	
	readonly userId: string;

	readonly title: string;

	readonly description: string;

	readonly messageFeature: MessageFeature;

	readonly quizFeature: QuizFeature;

	readonly protected: boolean;

	readonly recorded: boolean;

}