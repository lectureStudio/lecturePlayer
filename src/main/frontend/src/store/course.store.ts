import { makeAutoObservable } from "mobx";

class CourseStore {

	courseId: number;

	timeStarted: number;

	title: string;

	description: string;


	constructor() {
		makeAutoObservable(this);
	}
}

export const courseStore = new CourseStore();