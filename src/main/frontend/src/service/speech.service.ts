import { HttpRequest } from "../utils/http-request";

export class SpeechService {

	private readonly apiPath = "/course/speech";


	requestSpeech(courseId: number): Promise<string> {
		return new HttpRequest({ responseType: "text" })
			.post<string>(this.apiPath + "/" + courseId, null);
	}

	cancelSpeech(courseId: number, speechRequestId: string): Promise<void> {
		return new HttpRequest()
			.delete(this.apiPath + "/" + courseId + "/" + speechRequestId);
	}

}