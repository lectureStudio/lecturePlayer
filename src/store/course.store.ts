import { makeAutoObservable } from "mobx";
import { Course } from "../model/course";
import { privilegeStore } from "./privilege.store";

class CourseStore {

	courses: Course[] = [];

	activeCourse: Course;

	isClassroom: boolean;


	constructor() {
		makeAutoObservable(this);
	}

	setActiveCourse(activeCourse: Course) {
		this.activeCourse = activeCourse;
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

	hasChatFeature() {
		return this.activeCourse.messageFeature != null && privilegeStore.canReadMessages();
	}

	hasQuizFeature() {
		return this.activeCourse.quizFeature != null && privilegeStore.canParticipateInQuiz();
	}

	hasFeatures() {
		return this.hasChatFeature() || this.hasQuizFeature();
	}

	reset() {
		// Do not reset fields that are used in any state.
	}
}

export const courseStore = new CourseStore();
