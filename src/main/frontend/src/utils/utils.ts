export class Utils {

	static isFirefox() {
		return navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
	}

	static createEvent<T>(type: string, payload?: T): CustomEvent<T> {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}
}