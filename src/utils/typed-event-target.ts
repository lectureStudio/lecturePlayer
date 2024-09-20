export default class TypedEventTarget<T> extends EventTarget {

	override addEventListener<K extends keyof GlobalEventHandlersEventMap>(
		type: K,
		listener: (this: T, ev: GlobalEventHandlersEventMap[K]) => void,
		options?: AddEventListenerOptions | boolean): void {
		super.addEventListener(type, listener as EventListenerOrEventListenerObject, options);
	}

	override removeEventListener<K extends keyof GlobalEventHandlersEventMap>(
		type: K,
		listener: (this: T, ev: GlobalEventHandlersEventMap[K]) => void,
		options?: EventListenerOptions | boolean): void {
		super.removeEventListener(type, listener as EventListenerOrEventListenerObject, options);
	}

}
