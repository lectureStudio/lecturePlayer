import { RenderController } from "../../render/render-controller";
import { ApplicationContext } from "./context";
import { DocumentController } from "./document.controller";
import { ModalController } from "./modal.controller";
import { PlaybackController } from "./playback.controller";
import { SpeechController } from "./speech.controller";
import { StreamController } from "./stream.controller";
import { ViewController } from "./view.controller";

export class RootController {

	protected readonly context: ApplicationContext;

	readonly documentController: DocumentController;

	readonly modalController: ModalController;

	readonly playbackController: PlaybackController;

	readonly speechController: SpeechController;

	readonly renderController: RenderController;

	readonly streamController: StreamController;

	readonly viewController: ViewController;


	constructor(context: ApplicationContext) {
		this.renderController = new RenderController();
		this.documentController = new DocumentController(this, context);
		this.modalController = new ModalController(this, context);
		this.streamController = new StreamController(this, context);
		this.playbackController = new PlaybackController(this, context);
		this.speechController = new SpeechController(this, context);
		this.viewController = new ViewController(this, context);
	}

}
