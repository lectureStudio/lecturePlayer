export class SpeechService {

	private readonly apiPath = "/course/speech";


	requestSpeech(courseId: number): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			fetch(this.apiPath + "/" + courseId, {
				method: "POST"
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status.toString());
				}

				resolve(response.text());
			})
			.catch(error => {
				reject(error);
			});
		});
	}

	cancelSpeech(courseId: number, speechRequestId: string): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fetch(this.apiPath + "/" + courseId + "/" + speechRequestId, {
				method: "DELETE"
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status.toString());
				}

				resolve();
			})
			.catch(error => {
				reject(error);
			});
		});
	}

}