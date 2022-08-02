import { Utils } from '../utils/utils';
import { MessageFeature, QuizFeature } from './course-feature';
import { CoursePrivilege } from './course-state';
import { CourseStateDocument } from './course-state-document';

class Course extends EventTarget {

	private _courseId: number;

	private _timeStarted: number;

	private _title: string;

	private _description: string;

	private _userId: string;

	private _userPrivileges: CoursePrivilege[] = [];

	private _chatFeature: MessageFeature;

	private _quizFeature: QuizFeature;

	private _documentMap: Map<bigint, CourseStateDocument>;

	private _activeDocument: CourseStateDocument;


	get courseId() {
		return this._courseId;
	}

	set courseId(courseId: number) {
		this._courseId = courseId;

		this.dispatchEvent(Utils.createEvent("course-id"));
	}

	get timeStarted() {
		return this._timeStarted;
	}

	set timeStarted(timeStarted: number) {
		this._timeStarted = timeStarted;

		this.dispatchEvent(Utils.createEvent("course-time-started"));
	}

	get title() {
		return this._title;
	}

	set title(title: string) {
		this._title = title;

		this.dispatchEvent(Utils.createEvent("course-title"));
	}

	get description() {
		return this._description;
	}

	set description(description: string) {
		this._description = description;

		this.dispatchEvent(Utils.createEvent("course-description"));
	}

	get userId() {
		return this._userId;
	}

	set userId(userId: string) {
		this._userId = userId;

		this.dispatchEvent(Utils.createEvent("course-user-id"));
	}

	get userPrivileges() {
		return this._userPrivileges;
	}

	set userPrivileges(privileges: CoursePrivilege[]) {
		this._userPrivileges = privileges;

		this.dispatchEvent(Utils.createEvent("course-user-privileges", privileges));
	}

	get chatFeature() {
		return this._chatFeature;
	}

	set chatFeature(feature: MessageFeature) {
		this._chatFeature = feature;

		this.dispatchEvent(Utils.createEvent("course-chat-feature", feature));
	}

	get quizFeature() {
		return this._quizFeature;
	}

	set quizFeature(feature: QuizFeature) {
		this._quizFeature = feature;

		this.dispatchEvent(Utils.createEvent("course-quiz-feature", feature));
	}

	get documentMap() {
		return this._documentMap;
	}

	set documentMap(map: Map<bigint, CourseStateDocument>) {
		this._documentMap = map;

		this.dispatchEvent(Utils.createEvent("course-documents"));
	}

	get activeDocument() {
		return this._activeDocument;
	}

	set activeDocument(document: CourseStateDocument) {
		this._activeDocument = document;

		this.dispatchEvent(Utils.createEvent("course-active-document"));
	}
}

export const course = new Course();