import { CourseParticipant } from "../model/participant";
import { HttpRequest } from "../utils/http-request";

export namespace CourseParticipantApi {

	export function getParticipants(courseId: number): Promise<CourseParticipant[]> {
		return new HttpRequest().get<CourseParticipant[]>(`/api/v1/course/participants/${courseId}`);
	}

}