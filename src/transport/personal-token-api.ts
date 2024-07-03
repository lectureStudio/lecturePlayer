import { PersonalToken } from "../model/personal-token";
import { HttpRequest } from "../utils/http-request";

export namespace PersonalTokenApi {

	export function getPersonalToken(): Promise<PersonalToken> {
		return new HttpRequest().get<PersonalToken>("/api/v1/token");
	}

	export function generatePersonalToken(): Promise<PersonalToken> {
		return new HttpRequest().post<PersonalToken>("/api/v1/token");
	}

	export function deletePersonalToken(): Promise<void> {
		return new HttpRequest().delete<void>("/api/v1/token");
	}
}
