import { ChatHistory } from "../service/chat.service";
import { HttpRequest } from "../utils/http-request";

export namespace CourseChatApi {

	export function getChatHistory(courseId: number): Promise<ChatHistory> {
		return new HttpRequest().get<ChatHistory>(`/api/v1/course/chat/history/${courseId}`);
	}

}