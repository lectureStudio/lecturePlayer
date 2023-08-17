import { StreamAction } from "./stream.action";

export class StreamSpeechAction extends StreamAction {

	readonly publisherId: bigint;

	readonly displayName: string;


	constructor(publisherId: bigint, displayName: string) {
		super();

		this.publisherId = publisherId;
		this.displayName = displayName;
	}

	toBuffer(): ArrayBuffer {
		throw new Error("Method not implemented.");
	}
}