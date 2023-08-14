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
}

export const courseStore = new CourseStore();