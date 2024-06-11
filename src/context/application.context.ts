import { createContext } from "@lit/context";
import { ModalController } from "../controller/modal.controller";
import { EventService } from "../service/event.service";
import { EventEmitter } from "../utils/event-emitter";

export class ApplicationContext {

	readonly eventEmitter: EventEmitter;

	readonly eventService: EventService;

	readonly modalController: ModalController;


	constructor() {
		this.eventEmitter = new EventEmitter();
		this.eventService = new EventService(this.eventEmitter);

		this.modalController = new ModalController();
	}
}

export const applicationContext = createContext<ApplicationContext>("appContext");
