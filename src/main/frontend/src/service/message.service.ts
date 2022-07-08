import { t } from "i18next";
import { Toaster } from "../component/toast/toaster";
import { ChatMessage, CourseFeatureResponse } from "../model/course-feature";

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

	postMessageFromForm(courseId: number, form: HTMLFormElement): Promise<CourseFeatureResponse> {
		const data = new FormData(form);
		const message: ChatMessage = {
			serviceId: data.get("serviceId").toString(),
			text: data.get("text").toString()
		};

		return this.postMessage(courseId, JSON.stringify(message))
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