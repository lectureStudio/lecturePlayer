import { CourseRole } from "./course";

export interface CourseCsvUser {

	readonly firstName: string;
	readonly familyName: string;
	readonly email: string;
	role: CourseRole;

}
