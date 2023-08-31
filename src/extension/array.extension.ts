declare global {

	interface Array<T> {
		equals(array: T[]): boolean;
	}

}

Array.prototype.equals = function (other: unknown[]) {
	if (!other) {
		return false;
	}
	if (this === other) {
		return true;
	}
	if (this.length != other.length) {
		return false;
	}

	for (let i = 0, l = this.length; i < l; i++) {
		if (this[i] instanceof Array && other[i] instanceof Array) {
			if (!this[i].equals(other[i])) {
				return false;
			}
		}
		else if (this[i] != other[i]) {
			// TODO optional: compare objects.
			return false;
		}
	}
	return true;
}

// Hide method from for-in loops.
Object.defineProperty(Array.prototype, "equals", { enumerable: false });

export { }