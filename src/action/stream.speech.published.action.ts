import { StreamSpeechAction } from "./stream.speech.action";

export class StreamSpeechPublishedAction extends StreamSpeechAction {

	constructor(publisherId: bigint, displayName: string) {
		super(publisherId, displayName);
	}
}