interface EventEntry{
	type: keyof DocumentEventMap,
	listener: Function
}

export class EventEmitter {

	private contexts: Map<string, Array<EventEntry>> = new Map();

	private activeContexts: Array<Array<EventEntry>> = [];


	public addEventListener<K extends keyof DocumentEventMap>(
			type: K,
			listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
			options?: boolean | AddEventListenerOptions): void {
		document.addEventListener(type, listener, options);

		if (this.activeContexts.length < 1) {
			return;
		}

		const active = this.activeContexts[this.activeContexts.length - 1];
		active.push({
			type: type,
			listener: listener,
		});
	}

	public removeEventListener<K extends keyof DocumentEventMap>(
			type: K,
			listener: (this: Document, ev: DocumentEventMap[K]) => unknown,
			options?: boolean | EventListenerOptions): void {
		document.removeEventListener(type, listener, options);
	}

	public dispatchEvent(event: Event): boolean {
		return document.dispatchEvent(event);
	}

	public createContext(name: string) {
		let context = this.contexts.get(name);
		if (!context) {
			context = [];

			this.contexts.set(name, context);
		}

		this.activeContexts.push(context);
	}

	public closeContext() {
		if (this.activeContexts.length == 0) {
			return;
		}

		this.activeContexts.pop();
	}

	public disposeContext(name: string) {
		const context = this.contexts.get(name);
		if (context) {
			// console.log("disposing event id", name, context.length)
			context.forEach(entry => {
				// console.log("disposing event", entry.type)
				document.removeEventListener(entry.type, entry.listener as (this: Document, ev: DocumentEventMap[keyof DocumentEventMap]) => unknown);
			});

			this.contexts.delete(name);

			this.removeActiveContext(context);
		}
	}

	private removeActiveContext(context: Array<EventEntry>) {
		function removeContext(value: Array<EventEntry>, index: number, array: Array<EventEntry>[]) {
			if (value == context) {
				array.splice(index, 1);
				return true;
			}
			return false;
		}

		this.activeContexts.filter(removeContext);
	}
}
