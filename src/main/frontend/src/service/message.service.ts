import { CourseFeatureResponse } from "../model/course-feature";

export class MessageService {

	private readonly apiPath = "/course/message";


	postMessage(courseId: number, message: string): Promise<CourseFeatureResponse> {
		return new Promise<CourseFeatureResponse>((resolve, reject) => {
			fetch(this.apiPath + "/post/" + courseId, {
				method: "POST",
				body: message,
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