export class Utils {

	static isFunction(func: any): boolean {
		return typeof func === "function";
	}

	static checkFunction(func: any): void {
		if (!this.isFunction(func)) {
			console.error("Consumer is not a function");
		}
	}

}