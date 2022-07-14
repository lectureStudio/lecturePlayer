import { StreamAction } from "./stream.action";
import {StreamActionType} from "./stream.action-type";

class StreamStartAction extends StreamAction {

	readonly courseId: number;


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
	}

	getType(): StreamActionType {
		return StreamActionType.STREAM_START;
	}

	public override toByteBuffer(): ArrayBuffer {
		return new ArrayBuffer(12);
	}
}

export { StreamStartAction };