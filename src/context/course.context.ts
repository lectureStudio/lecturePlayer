import { createContext } from "@lit/context";
import { CourseLayoutController } from "../controller/course-layout.controller";
import { RenderController } from "../controller/render.controller";
import { Course } from "../model/course";
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

	readonly layoutController: CourseLayoutController;


	constructor(applicationContext: ApplicationContext, course: Course) {
		this.applicationContext = applicationContext;
		this.chatService = new ChatService(course.id);
		this.documentService = new DocumentService();
		this.moderationService = new ModerationService(course.id);

		this.renderController = new RenderController();
		this.layoutController = new CourseLayoutController(this);
	}
}

export const courseContext = createContext<CourseContext>("courseContext");
