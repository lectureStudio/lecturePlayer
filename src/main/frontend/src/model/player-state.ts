import { CourseState } from "./course-state";
import { SlideDocument } from "./document";

export class PlayerState {

	chatVisible: boolean = true;

	courseState: CourseState;

	documents: SlideDocument[];

}

export const playerState = new PlayerState();