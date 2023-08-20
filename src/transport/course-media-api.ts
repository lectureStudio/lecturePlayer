import { MediaStreamState } from "../model/event/queue-events";
import { HttpRequest } from "../utils/http-request";

export namespace CourseMediaApi {

	export function updateMediaStreamState(courseId: number, state: MediaStreamState) {
		return new HttpRequest().post<void>(`/api/v1/course/media/state/${courseId}`, state);
	}

}