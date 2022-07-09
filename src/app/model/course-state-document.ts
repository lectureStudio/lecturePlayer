import { CourseStatePage } from "./course-state-page";

export interface CourseStateDocument {

	readonly documentId: bigint;

	readonly documentName: string;

	readonly documentFile: string;

	readonly type: string;

	readonly activePage: CourseStatePage | null;

	readonly pages: Map<number, CourseStatePage> | null;

}