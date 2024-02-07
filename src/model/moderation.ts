export type ModerationType = "PERMANENT_BAN";

export interface CourseParticipantModeration {

	readonly userId: string;

	readonly firstName: string;

	readonly familyName: string;

	readonly moderationType: ModerationType;
}
