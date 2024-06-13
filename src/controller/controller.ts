import { ApplicationContext } from "../context/application.context";
import { EventEmitter } from "../utils/event-emitter";

export abstract class Controller {

	protected readonly applicationContext: ApplicationContext;

	protected readonly id: string;


	protected constructor(applicationContext: ApplicationContext) {
		this.applicationContext = applicationContext;
		this.id = Math.random().toString(36);

		this.initialize();
	}

	protected abstract initializeEvents(eventEmitter: EventEmitter): void;

	protected initialize(): void {
		const eventEmitter = this.applicationContext.eventEmitter;
		eventEmitter.createContext(this.id);

		this.initializeEvents(eventEmitter);

		eventEmitter.closeContext();
	}

	dispose(): void {
		this.applicationContext.eventEmitter.disposeContext(this.id);
	}
}
