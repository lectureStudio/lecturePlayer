import { CourseFeatureResponse } from "../model/course-feature";

export class QuizService {

	private readonly apiPath = "/course/quiz";


	postAnswer(courseId: number, answer: string): Promise<CourseFeatureResponse> {
		return new Promise<CourseFeatureResponse>((resolve, reject) => {
			fetch(this.apiPath + "/post/" + courseId, {
				method: "POST",
				body: answer,
				headers: {
					"Content-Type": "application/json"
				}
			})
			.then(response => response.json())
			.then(jsonResponse => {
				resolve(jsonResponse as CourseFeatureResponse);
			})
			.catch(error => {
				reject(error);
			});
		});
	}
}