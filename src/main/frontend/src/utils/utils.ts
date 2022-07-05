export class Utils {

	static isObject(item: any) {
		return (item && typeof item === 'object' && !Array.isArray(item));
	}

	static mergeDeep(target: any, source: any) {
		let output = Object.assign({}, target);

		if (Utils.isObject(target) && Utils.isObject(source)) {
			Object.keys(source).forEach(key => {
				if (Utils.isObject(source[key])) {
					if (!(key in target)) {
						Object.assign(output, { [key]: source[key] });
					}
					else {
						output[key] = Utils.mergeDeep(target[key], source[key]);
					}
				}
				else {
					Object.assign(output, { [key]: source[key] != null ? source[key] : target[key] });
				}
			});
		}

		return output;
	}

	static createEvent(type: string, payload?: any): CustomEvent {
		return new CustomEvent(type, {
			detail: payload,
			bubbles: true,
			composed: true,
		});
	}
}