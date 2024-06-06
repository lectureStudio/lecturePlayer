import { ChatService } from "../../service/chat.service";
import { EventService } from "../../service/event.service";
import { ModerationService } from "../../service/moderation.service";
import { EventEmitter } from "../../utils/event-emitter";
import { LecturePlayer } from "../player/player";

export class ApplicationContext {

	readonly host: LecturePlayer;

	readonly eventEmitter: EventEmitter;

	readonly eventService: EventService;

	readonly chatService: ChatService;

	readonly moderationService: ModerationService;

}
