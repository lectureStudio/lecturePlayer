import { StreamActionType } from "./stream.action-type";

export abstract class StreamAction {

	protected actionType: StreamActionType;


	/**
	 * Creates a new {@code ArrayBuffer} with the payload and inserts the required
	 * action header parameters. The buffer will be of the size of the payload
	 * length + the length of the header.
	 *
	 * @return A new {@code ArrayBuffer} with pre-filled action header and payload.
	 */
	abstract toBuffer(): ArrayBuffer;

}