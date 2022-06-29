import { CourseStateDocument } from "./course-state-document";
import { SlideDocument } from "./document";

export interface CourseFeature {

	featureId: string

}

export interface MessageFeature extends CourseFeature {


}

export enum QuizType {

	Multiple = "MULTIPLE",
	Single = "SINGLE",
	Numeric = "NUMERIC"

}

export interface QuizFeature extends CourseFeature {

	readonly type: QuizType;

	readonly question: string;

	readonly options: string[];

}

export interface QuizState {

	readonly courseId: number;

	readonly started: boolean;

	readonly feature: QuizFeature;

}

export interface CourseState {

	readonly documentMap: Map<bigint, CourseStateDocument>;

	readonly avtiveDocument: CourseStateDocument;

	readonly timeStarted: number;
	
	readonly userId: string;

	readonly title: string;

	readonly description: string;

	messageFeature: MessageFeature;

	quizFeature: QuizFeature;

	readonly protected: boolean;

	readonly recorded: boolean;

}

export interface CourseStateDocuments {

	readonly courseState: CourseState;

	readonly documents: SlideDocument[];

}