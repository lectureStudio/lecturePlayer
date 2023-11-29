import { HttpRequest } from "../utils/http-request";

export namespace CourseFileApi {

	export function downloadFile(fileUrl: string): Promise<ArrayBuffer> {
		return new HttpRequest()
			.setResponseType("arraybuffer")
			.get<ArrayBuffer>(fileUrl);
	}

}