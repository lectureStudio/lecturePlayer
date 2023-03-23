import { StreamAction } from "./stream.action";

export class StreamStartAction extends StreamAction {

	readonly courseId: number;


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
	}

	toBuffer(): ArrayBuffer {
		throw new Error("Method not implemented.");
	}
}