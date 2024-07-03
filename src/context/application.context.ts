import { createContext } from "@lit/context";
import { ModalController } from "../controller/modal.controller";
import { ColorSchemeService } from "../service/color-scheme.service";
import { EventService } from "../service/event.service";
import { LanguageService } from "../service/language.service";
import { EventEmitter } from "../utils/event-emitter";

export class ApplicationContext {

	readonly eventEmitter: EventEmitter;

	readonly eventService: EventService;

	readonly colorSchemeService: ColorSchemeService;

	readonly languageService: LanguageService;

	readonly modalController: ModalController;


	constructor() {
		this.eventEmitter = new EventEmitter();
		this.eventService = new EventService(this.eventEmitter);
		this.colorSchemeService = new ColorSchemeService();
		this.languageService = new LanguageService();

		this.modalController = new ModalController();
	}
}

export const applicationContext = createContext<ApplicationContext>("appContext");
