import { CourseParticipant } from "../model/participant";
import { HttpRequest } from "../utils/http-request";

export namespace CourseUserApi {

	export function getUserInformation(): Promise<CourseParticipant> {
		return new HttpRequest().get<CourseParticipant>("/api/v1/course/user");
	}

}