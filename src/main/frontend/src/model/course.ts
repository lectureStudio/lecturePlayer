import { Utils } from '../utils/utils';
import { CourseMediaState } from './course-state';
import { CourseStateDocument } from './course-state-document';

class Course extends EventTarget {

	private _documentMap: Map<bigint, CourseStateDocument>;

	private _activeDocument: CourseStateDocument;

	private _mediaState: CourseMediaState;


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

	get mediaState() {
		return this._mediaState;
	}

	set mediaState(state: CourseMediaState) {
		this._mediaState = state;

		this.dispatchEvent(Utils.createEvent("course-media-state"));
	}
}

export const course = new Course();