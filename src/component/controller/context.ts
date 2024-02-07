import {ChatService} from "../../service/chat.service";
import {EventEmitter} from "../../utils/event-emitter";
import {LecturePlayer} from "../player/player";
import {ModerationService} from "../../service/moderation.service";

export class ApplicationContext {

	readonly host: LecturePlayer;

	readonly eventEmitter: EventEmitter;

	readonly chatService: ChatService;

	readonly moderationService: ModerationService;

}
