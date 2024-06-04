import { Course } from "../model/course";
import { HttpRequest } from "../utils/http-request";

export namespace CourseApi {

	export function getCourses(): Promise<Course[]> {
		return new HttpRequest().get<Course[]>("/api/v1/course/courses");
	}

}
