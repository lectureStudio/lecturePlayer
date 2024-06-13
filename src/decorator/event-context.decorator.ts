export default function EventContext<This, Args extends unknown[], Return>(contextName: string) {
	return function actualDecorator(
		target: (this: This, ...args: Args) => Return,
		context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Return>) {
		const methodName = String(context.name);

		function replacementMethod(this: This, ...args: Args): Return {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			const { eventEmitter } = (this as unknown)["applicationContext"];

			if (eventEmitter) {
				console.log(`Entering context '${contextName}' in method '${methodName}'.`)
				eventEmitter.createContext(contextName);
			}

			const result = target.call(this, ...args);

			if (eventEmitter) {
				console.log(`Exiting context '${contextName}' in method '${methodName}'.`)
				eventEmitter.closeContext();
			}

			return result;
		}

		return replacementMethod;
	}
}
