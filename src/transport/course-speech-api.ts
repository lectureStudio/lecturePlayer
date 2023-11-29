import { HttpRequest } from "../utils/http-request";

export namespace CourseSpeechApi {

	export function requestSpeech(courseId: number) {
		return new HttpRequest()
			.setResponseType("text")
			.post<string, void>(`/api/v1/course/speech/${courseId}`);
	}

	export function cancelSpeech(courseId: number, requestId: string) {
		return new HttpRequest()
			.delete(`/api/v1/course/speech/${courseId}/${requestId}`);
	}

}