export interface HttpResponse {

	readonly status: number;

	readonly statusText: string;

	readonly headers: Map<string, string | string[]>;

	readonly body: XMLHttpRequestBodyInit;

}