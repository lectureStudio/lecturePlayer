import { t } from "i18next";
import { Toaster } from "../utils/toaster";
import { CourseFeatureResponse, QuizAnswer } from "../model/course-feature";

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

	postAnswerFromForm(courseId: number, form: HTMLFormElement): Promise<CourseFeatureResponse> {
		const data = new FormData(form);
		const answer: QuizAnswer = {
			serviceId: data.get("serviceId").toString(),
			options: data.getAll("options") as string[]
		};

		return this.postAnswer(courseId, JSON.stringify(answer))
			.then(response => {
				if (response.statusCode === 0) {
					Toaster.showSuccess(`${t(response.statusMessage)}`);
				}
				else {
					Toaster.showError(`${t(response.statusMessage)}`);
				}

				return response;
			});
	}
}