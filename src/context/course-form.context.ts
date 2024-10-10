import { createContext } from "@lit/context";
import { CourseForm } from "../model/course";

export class CourseFormContext {

	readonly courseForm: CourseForm;


	constructor(courseForm: CourseForm) {
		this.courseForm = courseForm;
	}
}

export const courseFormContext = createContext<CourseFormContext>("courseFormContext");
