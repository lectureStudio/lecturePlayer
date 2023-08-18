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

	reset() {
		this.courseId = null;
		this.timeStarted = null;
		this.title = null;
		this.description = null;
		this.conference = null;
		this.recorded = null;
	}
}

export const courseStore = new CourseStore();