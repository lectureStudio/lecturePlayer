export interface Listener<T> {

	(event: T): void;

}

export interface Disposable {

	dispose(): void;

}

export class TypedEvent<T> {

	private listeners: Listener<T>[] = [];


	subscribe(listener: Listener<T>): Disposable {
		this.listeners.push(listener);

		return {
			dispose: () => this.unsubscribe(listener)
		};
	}

	unsubscribe(listener: Listener<T>): void {
		const callbackIndex = this.listeners.indexOf(listener);

		if (callbackIndex > -1) {
			this.listeners.splice(callbackIndex, 1);
		}
	}

	unsubscribeAll(): void {
		this.listeners.splice(0);
	}

	publish(event: T): void {
		this.listeners.forEach((listener) => listener(event));
	}
}