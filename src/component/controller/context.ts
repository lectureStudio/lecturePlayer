import { ChatService } from "../../service/chat.service";
import { EventEmitter } from "../../utils/event-emitter";
import { LecturePlayer } from "../player/player";

export class ApplicationContext {

	readonly host: LecturePlayer;

	readonly eventEmitter: EventEmitter;

	readonly chatService: ChatService;

}