import { StreamAction } from "./stream.action";

class StreamSpeechAction extends StreamAction {

	readonly publisherId: bigint;


	constructor(publisherId: bigint) {
		super();

		this.publisherId = publisherId;
	}
}

export { StreamSpeechAction };