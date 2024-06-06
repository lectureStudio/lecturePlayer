import { CourseFeature, MessageFeature, QuizFeature } from "./course-feature";
import { CourseStateDocument } from "./course-state-document";

export interface CourseFeatureState<CourseFeature> {

	readonly courseId: number;

	readonly started: boolean;

	readonly feature: CourseFeature;

}

export interface CoursePrivilege {

	readonly name: string;

	readonly descriptionKey: string;

}

export interface CourseState {

	readonly courseId: number;

	documentMap: Map<bigint, CourseStateDocument>;

	activeDocument: CourseStateDocument;

	readonly timeStarted: number;
	
	readonly userId: string;

	readonly title: string;

	readonly description: string;

	messageFeature: MessageFeature;

	quizFeature: QuizFeature;

	readonly conference: boolean;

	readonly protected: boolean;

	readonly recorded: boolean;

	readonly userPrivileges: CoursePrivilege[];

}
