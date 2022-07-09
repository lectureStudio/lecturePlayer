import { CourseStateDocument } from "./course-state-document";

export interface CourseState {

	readonly documentMap: Map<bigint, CourseStateDocument>;

	readonly avtiveDocument: CourseStateDocument;

}