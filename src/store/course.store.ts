import { makeAutoObservable } from "mobx";
import { Course, CourseRole } from "../model/course";
import { privilegeStore } from "./privilege.store";

class CourseStore {

	courses: Course[] = [];

	courseRoles: CourseRole[] = [];

	activeCourse: Course | null;

	isClassroom: boolean;


	constructor() {
		makeAutoObservable(this);
	}

	setActiveCourse(activeCourse: Course | null) {
		this.activeCourse = activeCourse;
	}

	setCourses(courses: Course[]) {
		this.courses = courses;
	}

	setCourseRoles(courseRoles: CourseRole[]) {
		this.courseRoles = courseRoles.sort((a, b) => a.order - b.order);
	}

	findCourseById(courseId: number): Course | undefined {
		return this.courses.find((course) => course.id === courseId);
	}

	findCourseByAccessLink(accessLink: string): Course | undefined {
		return this.courses.find((course) => course.defaultAccessLink === accessLink);
	}

	findCourseRoleByName(roleName: string): CourseRole | undefined {
		return this.courseRoles.find(role => role.name === roleName);
	}

	hasChatFeature() {
		return this.activeCourse?.messageFeature != null && privilegeStore.canReadMessages();
	}

	hasQuizFeature() {
		return this.activeCourse?.quizFeature != null && privilegeStore.canParticipateInQuiz();
	}

	hasFeatures() {
		return this.hasChatFeature() || this.hasQuizFeature();
	}

	reset() {
		// Do not reset fields that are used in any state.
	}
}

export const courseStore = new CourseStore();
