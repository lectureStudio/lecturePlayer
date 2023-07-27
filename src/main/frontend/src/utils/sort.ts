import { ParticipantType } from "../model/course-state";

export enum SortOrder {

	Ascending,
	Descending

}

export enum ParticipantSortProperty {

	Affiliation,
	FirstName,
	LastName,

}

export namespace ParticipantSortPropertyUtil {

	export function toString(property: ParticipantSortProperty): string {
		return ParticipantSortProperty[property];
	}

}

/**
 * This is equivalent to:
 * type ParticipantSortProperty = 'FirstName' | 'LastName';
 */
export type ParticipantSortPropertyType = keyof typeof ParticipantSortProperty;

export type TypeComparator<T> = (a: T, b: T) => number;

export const StringComparator: TypeComparator<string> = (a: string, b: string) => {
	return a.localeCompare(b);
};

export const ParticipantTypeComparator: TypeComparator<ParticipantType> = (a: ParticipantType, b: ParticipantType) => {
	if (a === b) {
		return 0;
	}
	if (a === "ORGANISATOR") {
		return 1;
	}
	if (b === "ORGANISATOR") {
		return -1;
	}
	if (a === "CO_ORGANISATOR") {
		return 1;
	}
	if (b === "CO_ORGANISATOR") {
		return -1;
	}

	return 0;
};