export class Utils {

	static isFunction(func: any): boolean {
		return typeof func === "function";
	}

	static checkFunction(func: any): void {
		if (!this.isFunction(func)) {
			console.error("Consumer is not a function");
		}
	}

	static createEvent(type: string, payload?: any): CustomEvent {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}
}