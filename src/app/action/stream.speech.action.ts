import { StreamAction } from "./stream.action";
import {StreamActionType} from "./stream.action-type";

class StreamSpeechAction extends StreamAction {

	readonly publisherId: bigint;


	constructor(publisherId: bigint) {
		super();

		this.publisherId = publisherId;
	}

	getType(): StreamActionType {
		return StreamActionType.STREAM_SPEECH_PUBLISHED;
	}

	public override toByteBuffer(): ArrayBuffer {
		return new ArrayBuffer(12);
	}
}

export { StreamSpeechAction };