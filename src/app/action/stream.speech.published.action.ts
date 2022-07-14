import { StreamSpeechAction } from "./stream.speech.action";
import {StreamActionType} from "./stream.action-type";

class StreamSpeechPublishedAction extends StreamSpeechAction {

	constructor(publisherId: bigint) {
		super(publisherId);
	}

	override getType(): StreamActionType {
		return StreamActionType.STREAM_SPEECH_PUBLISHED;
	}
}

export { StreamSpeechPublishedAction };