import { CourseFeatureResponse, QuizAnswer } from "../model/course-feature";
import { HttpRequest } from "../utils/http-request";

export namespace CourseQuizApi {

	export function postQuizAnswer(courseId: number, answer: QuizAnswer) {
		return new HttpRequest()
			.setHttpHeaders(new Map([["Content-Type", "application/json"]]))
			.post<CourseFeatureResponse>(`/api/v1/course/quiz/${courseId}`, JSON.stringify(answer));
	}

}