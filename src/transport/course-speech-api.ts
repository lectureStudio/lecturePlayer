import { HttpRequest } from "../utils/http-request";

export namespace CourseSpeechApi {

	export function requestSpeech(courseId: number) {
		return new HttpRequest().post<string>(`/api/v1/course/speech/${courseId}`);
	}

	export function cancelSpeech(courseId: number, requestId: string) {
		return new HttpRequest().post<void>(`/api/v1/course/speech/${courseId}/${requestId}`);
	}

}