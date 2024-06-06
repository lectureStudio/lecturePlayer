import { MessageFeature, QuizFeature } from "./course-feature";
import { CoursePrivilege } from "./course-state";

export interface CourseAuthor {

	readonly firstName: string;

	readonly familyName: string;

}

export interface Course {

	readonly id: number;

	readonly defaultAccessLink: string;

	readonly title: string;

	readonly description: string;

	readonly authors: CourseAuthor[];

	messageFeature: MessageFeature | null;

	quizFeature: QuizFeature | null;

	isConference: boolean;

	isProtected: boolean;

	isRecorded: boolean;

	isLive: boolean;

	canEdit: boolean;

	canDelete: boolean;

	userPrivileges: CoursePrivilege[];

}
