import { MediaType } from "../model/media-type";
import { StreamAction } from "./stream.action";
import { StreamActionType } from "./stream.action-type";

export class StreamMediaChangeAction extends StreamAction {

	readonly type: MediaType;

	readonly enabled: boolean;


	constructor(type: MediaType, enabled: boolean) {
		super();

		this.type = type;
		this.enabled = enabled;
	}

	toBuffer(): ArrayBuffer {
		const buffer = new ArrayBuffer(6);

		const view = new DataView(buffer);
		view.setInt32(0, buffer.byteLength);
		view.setInt8(4, this.toActionType());
		view.setInt8(5, this.enabled ? 1 : 0);

		return buffer;
	}

	private toActionType(): StreamActionType {
		switch (this.type) {
			case MediaType.Audio:
				return StreamActionType.STREAM_MICROPHONE_CHANGE;
			case MediaType.Camera:
				return StreamActionType.STREAM_CAMERA_CHANGE;
			case MediaType.Screen:
				return StreamActionType.STREAM_SCREEN_SHARE_CHANGE;

			default:
				throw new Error("ActionType not implemented");
		}
	}
}