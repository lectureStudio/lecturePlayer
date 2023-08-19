import { makeAutoObservable } from "mobx";

class CourseStore {

	courseId: number;

	timeStarted: number;

	title: string;

	description: string;

	conference: boolean;

	recorded: boolean;


	constructor() {
		makeAutoObservable(this);
	}

	setCourseId(id: number) {
		this.courseId = id;
	}

	setTimeStarted(timestamp: number) {
		this.timeStarted = timestamp;
	}

	setTitle(title: string) {
		this.title = title;
	}

	setDescription(description: string) {
		this.description = description;
	}

	setConference(conference: boolean) {
		this.conference = conference;
	}

	setRecorded(recorded: boolean) {
		this.recorded = recorded;
	}

	reset() {
		// Do not reset fields that are used in any state.
		this.timeStarted = null;
		this.conference = null;
		this.recorded = null;
	}
}

export const courseStore = new CourseStore();