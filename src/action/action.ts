import { ActionExecutor } from "./action-executor";
import { ActionType } from "./action-type";

export abstract class Action {

	keyEvent: KeyboardEvent | undefined;

	timestamp: number;


	abstract execute(executor: ActionExecutor): void;

	abstract getActionType(): ActionType;

	/**
	 * Creates a new {@code ArrayBuffer} with the payload and inserts the required
	 * action header parameters. The buffer will be of the size of the payload
	 * length + the length of the header.
	 *
	 * @return A new {@code ArrayBuffer} with pre-filled action header and payload.
	 */
	abstract toBuffer(): ArrayBuffer;

	protected createBuffer(length: number): { buffer: ArrayBuffer, dataView: DataView } {
		// The header has a length of 13 bytes.
		const buffer = new Uint8Array(13 + length);
		const view = new DataView(buffer.buffer);

		// Write header
		view.setInt32(0, length + 5);
		view.setInt8(4, this.getActionType());
		view.setInt32(5, this.timestamp);
		// No key-event yet, length is zero.
		view.setInt32(9, 0);

		return { buffer: buffer, dataView: view };
	}

}