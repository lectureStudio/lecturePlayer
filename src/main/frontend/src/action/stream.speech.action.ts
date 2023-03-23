import { StreamAction } from "./stream.action";

export class StreamSpeechAction extends StreamAction {

	readonly publisherId: bigint;


	constructor(publisherId: bigint) {
		super();

		this.publisherId = publisherId;
	}

	toBuffer(): ArrayBuffer {
		throw new Error("Method not implemented.");
	}
}