export interface CourseFeature {

	featureId: string

}

export interface CourseFeatureResponse {

	statusCode: number;

	statusMessage: string;

}

export interface MessageFeature extends CourseFeature {

}

export enum QuizType {

	Multiple = "MULTIPLE",
	Single = "SINGLE",
	Numeric = "NUMERIC"

}

export interface QuizAnswer {

	serviceId: string;

	options: string[];

}

export interface QuizFeature extends CourseFeature {

	readonly type: QuizType;

	readonly question: string;

	readonly options: string[];

}