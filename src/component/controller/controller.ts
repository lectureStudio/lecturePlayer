import { ApplicationContext } from "./context";
import { RootController } from "./root.controller";

export class Controller {

	protected readonly rootController: RootController;

	protected readonly context: ApplicationContext;


	constructor(rootController: RootController, context: ApplicationContext) {
		this.rootController = rootController;
		this.context = context
	}

	get eventEmitter() {
		return this.context.eventEmitter;
	}

	get chatService() {
		return this.context.chatService;
	}

	get documentController() {
		return this.rootController.documentController;
	}

	get modalController() {
		return this.rootController.modalController;
	}

	get playbackController() {
		return this.rootController.playbackController;
	}

	get renderController() {
		return this.rootController.renderController;
	}

	get streamController() {
		return this.rootController.streamController;
	}
}