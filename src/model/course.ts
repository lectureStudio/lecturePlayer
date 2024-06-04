import { MessageFeature, QuizFeature } from "./course-feature";
import { CoursePrivilege } from "./course-state";

export interface Course {

	readonly courseId: number;

	readonly defaultAccessLink: string;

	readonly roomId: string;

	readonly title: string;

	readonly description: string;

	readonly messageFeature: MessageFeature;

	readonly quizFeature: QuizFeature;

	readonly conference: boolean;

	readonly protected: boolean;

	readonly recorded: boolean;

	readonly canEdit: boolean;

	readonly canDelete: boolean;

	readonly userPrivileges: CoursePrivilege[];

}
