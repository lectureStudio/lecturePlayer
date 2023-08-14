export interface CourseFeature {

	featureId: string

}

export interface CourseFeatureResponse {

	statusCode: number;

	statusMessage: string;

	fieldErrors: Map<number, string>;

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

export interface QuizRule {

	type: string;

	fieldId: number;

	isAllowed(value: any): boolean;

}

export interface QuizMinMaxRule extends QuizRule {

	min: number;
	max: number;

}

export interface QuizInputFieldFilter {

	rules: QuizRule[];

}

export interface QuizFeature extends CourseFeature {

	readonly type: QuizType;

	readonly question: string;

	readonly options: string[];

	readonly fieldFilter: QuizInputFieldFilter;

}