export class SpeechService {

	private readonly apiPath = "/course/speech";


	requestSpeech(courseId: number): Promise<bigint> {
		return new Promise<bigint>((resolve, reject) => {
			fetch(this.apiPath + "/" + courseId, {
				method: "POST"
			})
			.then(response => {
				if (!response.ok) {
					throw new Error(response.status.toString());
				}

				response.text().then(text => {
					resolve(BigInt(text));
				});
			})
			.catch(error => {
				reject(error);
			});
		});
	}

	cancelSpeech(courseId: number, speechRequestId: bigint): Promise<void> {
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