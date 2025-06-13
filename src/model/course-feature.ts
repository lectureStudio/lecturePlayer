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
	Numeric = "NUMERIC",
	FreeText = "FREE_TEXT"

}

export interface QuizAnswer {

	serviceId: string;

	options: string[];

}

export interface QuizRule<T> {

	type: string;

	fieldId: number;

	isAllowed(value: T): boolean;

}

export interface QuizMinMaxRule extends QuizRule<number> {

	min: number;
	max: number;

}

export interface QuizInputFieldFilter {

	rules: QuizRule<unknown>[];

}

export interface QuizFeature extends CourseFeature {

	readonly type: QuizType;

	readonly question: string;

	readonly options: string[];

	readonly fieldFilter: QuizInputFieldFilter;

}
