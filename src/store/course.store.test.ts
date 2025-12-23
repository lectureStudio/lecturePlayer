import { expect } from "@open-wc/testing";
import { courseStore } from "./course.store.js";

describe("CourseStore", () => {
	afterEach(() => {
		courseStore.reset();
	});

	describe("setCourseId", () => {
		it("sets course ID", () => {
			courseStore.setCourseId(123);
			expect(courseStore.courseId).to.equal(123);
		});
	});

	describe("setTimeStarted", () => {
		it("sets time started", () => {
			const time = Date.now();
			courseStore.setTimeStarted(time);
			expect(courseStore.timeStarted).to.equal(time);
		});
	});

	describe("setTitle", () => {
		it("sets title", () => {
			courseStore.setTitle("Test Course");
			expect(courseStore.title).to.equal("Test Course");
		});
	});

	describe("setDescription", () => {
		it("sets description", () => {
			courseStore.setDescription("A test description");
			expect(courseStore.description).to.equal("A test description");
		});
	});

	describe("setConference", () => {
		it("sets conference flag to true", () => {
			courseStore.setConference(true);
			expect(courseStore.conference).to.be.true;
		});

		it("sets conference flag to false", () => {
			courseStore.setConference(false);
			expect(courseStore.conference).to.be.false;
		});
	});

	describe("setRecorded", () => {
		it("sets recorded flag to true", () => {
			courseStore.setRecorded(true);
			expect(courseStore.recorded).to.be.true;
		});

		it("sets recorded flag to false", () => {
			courseStore.setRecorded(false);
			expect(courseStore.recorded).to.be.false;
		});
	});

	describe("reset", () => {
		it("resets timeStarted", () => {
			courseStore.setTimeStarted(Date.now());
			courseStore.reset();
			expect(courseStore.timeStarted).to.be.undefined;
		});

		it("resets conference", () => {
			courseStore.setConference(true);
			courseStore.reset();
			expect(courseStore.conference).to.be.undefined;
		});

		it("resets recorded", () => {
			courseStore.setRecorded(true);
			courseStore.reset();
			expect(courseStore.recorded).to.be.undefined;
		});

		it("does not reset courseId", () => {
			courseStore.setCourseId(123);
			courseStore.reset();
			expect(courseStore.courseId).to.equal(123);
		});

		it("does not reset title", () => {
			courseStore.setTitle("Test");
			courseStore.reset();
			expect(courseStore.title).to.equal("Test");
		});
	});
});

