import { makeAutoObservable } from "mobx";
import { Course } from "../model/course";

class CourseStore {

	courses: Course[] = [];

	courseId: number;

	timeStarted: number | undefined;

	title: string;

	description: string;

	conference: boolean | undefined;

	recorded: boolean | undefined;

	isClassroom: boolean;

	isLive: boolean;


	constructor() {
		makeAutoObservable(this);
	}

	setCourses(courses: Course[]) {
		this.courses = courses;
	}

	findCourseById(courseId: number): Course | undefined {
		return this.courses.find((course) => course.id === courseId);
	}

	findCourseByAccessLink(accessLink: string): Course | undefined {
		return this.courses.find((course) => course.defaultAccessLink === accessLink);
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
		this.timeStarted = undefined;
		this.conference = undefined;
		this.recorded = undefined;
	}
}

export const courseStore = new CourseStore();
