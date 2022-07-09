import { StreamAction } from "./stream.action";

class StreamStartAction extends StreamAction {

	readonly courseId: number;


	constructor(courseId: number) {
		super();

		this.courseId = courseId;
	}
}

export { StreamStartAction };