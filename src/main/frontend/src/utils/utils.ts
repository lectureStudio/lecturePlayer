export class Utils {

	static isFirefox() {
		return navigator.userAgent.indexOf("Firefox") != -1;
	}

	static createEvent(type: string, payload?: any): CustomEvent {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}
}