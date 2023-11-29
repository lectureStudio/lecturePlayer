import { CourseState } from "../model/course-state";
import { HttpRequest } from "../utils/http-request";

export namespace CourseStateApi {

	export function getCourseState(courseId: number): Promise<CourseState> {
		return new HttpRequest()
			.get<CourseState>(`/api/v1/course/state/${courseId}`);
	}

	export function getDocummentActions(courseId: number, documentId: bigint): Promise<ArrayBuffer> {
		return new HttpRequest()
			.setResponseType("arraybuffer")
			.get<ArrayBuffer>(`/api/v1/course/state/${courseId}/pages/${documentId}`);
	}

	export function getPageActions(courseId: number, documentId: bigint, pageNumber: number): Promise<ArrayBuffer> {
		return new HttpRequest()
			.setResponseType("arraybuffer")
			.get<ArrayBuffer>(`/api/v1/course/state/${courseId}/pages/${documentId}/${pageNumber}`);
	}

}