import { StreamSpeechAction } from "./stream.speech.action";

class StreamSpeechPublishedAction extends StreamSpeechAction {

	constructor(publisherId: bigint) {
		super(publisherId);
	}
}

export { StreamSpeechPublishedAction };