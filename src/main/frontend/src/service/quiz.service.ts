import { CourseFeatureResponse, QuizAnswer } from "../model/course-feature";
import { HttpRequest } from "../utils/http-request";

export class QuizService {

	private readonly apiPath = "/course/quiz";


	postAnswerFromForm(courseId: number, form: HTMLFormElement): Promise<CourseFeatureResponse> {
		const data = new FormData(form);
		const answer: QuizAnswer = {
			serviceId: data.get("serviceId").toString(),
			options: data.getAll("options") as string[]
		};

		return new HttpRequest()
			.setHttpHeaders(new Map([["Content-Type", "application/json"]]))
			.post<CourseFeatureResponse>(this.apiPath + "/post/" + courseId, JSON.stringify(answer));
	}
}