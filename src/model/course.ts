import { MessageFeature, QuizFeature } from "./course-feature";

export interface CourseAlias {

	readonly name: string;
	readonly url: string;
	readonly expiry?: string;
	readonly isDefault: boolean;

}

export interface CourseAuthor {

	readonly firstName: string;
	readonly familyName: string;

}

export interface CourseRole {

	readonly name: string;
	readonly description: string;
	readonly order: number;

}

export interface CoursePrivilege {

	readonly name: string;
	readonly description: string;
	readonly dependencies?: CoursePrivilege[];
	readonly order: number;

}

export interface Course {

	readonly id: number;
	readonly defaultAccessLink: string;
	readonly title: string;
	readonly description: string;
	readonly authors: CourseAuthor[];
	messageFeature: MessageFeature | null;
	quizFeature: QuizFeature | null;
	timeStarted: number | null;
	isConference: boolean;
	isProtected: boolean;
	isRecorded: boolean;
	isLive: boolean;
	canEdit: boolean;
	canDelete: boolean;
	userPrivileges: CoursePrivilege[];

}

export interface CourseManagedUser {

	readonly user: {
		readonly userId: string;
		readonly firstName: string;
		readonly familyName: string;
		readonly email: string;
	};
	readonly role: CourseRole;
	readonly blocked: boolean;

}

export interface CourseForm {

	title: string;
	description: string;
	passcode: string;
	isHidden: boolean;
	roles: CourseRole[];
	privilegedUsers: CourseManagedUser[];
	accessLinks: CourseAlias[];

}

export const aliase: CourseAlias[] = [
	{
		expiry: "2025-06-12T19:30",
		name: "tutorial",
		url: "https://lect.stream/course/tutorial",
		isDefault: false,
	},
	{
		name: "85dee7a6-00ea-457e-8fa1-62be381ac554",
		url: "https://lect.stream/course/85dee7a6-00ea-457e-8fa1-62be381ac554",
		isDefault: true,
	},
];

export const coursePrivileges: CoursePrivilege[] = [
	{
		name: "COURSE_ALTER_PRIVILEGES",
		description: "course.privilege.course.alter.privileges",
		order: 0
	},
	{
		name: "COURSE_ACCESS",
		description: "course.privilege.course.access",
		order: 1
	},
	{
		name: "COURSE_EDIT",
		description: "course.privilege.course.edit",
		order: 2
	},
	{
		name: "COURSE_DELETE",
		description: "course.privilege.course.delete",
		order: 3
	},
	{
		name: "COURSE_STREAM",
		description: "course.privilege.course.stream",
		order: 4
	},
	{
		name: "CHAT_READ",
		description: "course.privilege.chat.read",
		order: 5
	},
	{
		name: "CHAT_WRITE",
		description: "course.privilege.chat.write",
		order: 6
	},
	{
		name: "CHAT_WRITE_TO_ORGANISATOR",
		description: "course.privilege.chat.write.to.organisator",
		order: 7
	},
	{
		name: "CHAT_WRITE_PRIVATELY",
		description: "course.privilege.chat.write.privately",
		order: 8
	},
	{
		name: "PARTICIPANTS_VIEW",
		description: "course.privilege.participants.view",
		order: 9
	},
	{
		name: "PARTICIPANTS_BAN",
		description: "course.privilege.participants.ban",
		order: 10
	},
	{
		name: "QUIZ_PARTICIPATION",
		description: "course.privilege.quiz.participation",
		order: 11
	},
	{
		name: "SPEECH",
		description: "course.privilege.speech",
		order: 12
	},
	{
		name: "AVATAR_SHOW",
		description: "course.privilege.avatar.show",
		order: 13
	},
	{
		name: "AVATAR_SEE",
		description: "course.privilege.avatar.see",
		order: 14
	},
];
