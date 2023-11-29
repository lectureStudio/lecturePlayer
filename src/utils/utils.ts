export class Utils {

	static isFirefox() {
		return navigator.userAgent.indexOf("Firefox") != -1;
	}

	static createEvent<T>(type: string, payload?: T): CustomEvent {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}
}