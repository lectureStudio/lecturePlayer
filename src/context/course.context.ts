import { createContext } from "@lit/context";
import { CourseLayoutController } from "../controller/course-layout.controller";
import { PlaybackController } from "../controller/playback.controller";
import { RenderController } from "../controller/render.controller";
import { SpeechController } from "../controller/speech.controller";
import { StreamController } from "../controller/stream.controller";
import { ChatService } from "../service/chat.service";
import { DocumentService } from "../service/document.service";
import { ModerationService } from "../service/moderation.service";
import { ApplicationContext } from "./application.context";

export class CourseContext {

	readonly applicationContext: ApplicationContext;

	readonly chatService: ChatService;

	readonly documentService: DocumentService;

	readonly moderationService: ModerationService;

	readonly renderController: RenderController;

	readonly streamController: StreamController;

	readonly playbackController: PlaybackController;

	readonly speechController: SpeechController;

	readonly layoutController: CourseLayoutController;


	constructor(applicationContext: ApplicationContext, courseId: number) {
		this.applicationContext = applicationContext;
		this.chatService = new ChatService(courseId);
		this.documentService = new DocumentService();
		this.moderationService = new ModerationService(courseId);

		this.renderController = new RenderController();
		this.streamController = new StreamController(this);
		this.playbackController = new PlaybackController(this);
		this.speechController = new SpeechController(this);
		this.layoutController = new CourseLayoutController(this);
	}
}

export const courseContext = createContext<CourseContext>("courseContext");
