import { makeAutoObservable } from "mobx";
import { CourseParticipant } from "../model/course-state";
import { SortConfig, SortOrder, compare } from "../utils/sort";

class ParticipantStore {

	participants: CourseParticipant[] = [];


	constructor() {
		makeAutoObservable(this);
	}

	addParticipant(participant: CourseParticipant) {
		this.participants = [...this.participants, participant];
	}

	removeParticipant(participant: CourseParticipant) {
		this.participants = this.participants.filter((p) => p.userId !== participant.userId);
	}

	updateParticipant(updated: CourseParticipant) {
		this.participants = this.participants.map((p) => p.userId !== updated.userId ? p : updated);
	}

	setParticipants(participants: CourseParticipant[]) {
		this.participants = participants;
	}

	clear() {
		this.participants = [];
	}

	sort(sortConfig: SortConfig<CourseParticipant>) {
		return this.participants.slice().sort(this.comparator(sortConfig));
	}

	findByUserId(userId: string) {
		return this.participants.find(participant => participant.userId === userId);
	}

	get count() {
		return this.participants.length;
	}

	private comparator(sortConfig: SortConfig<CourseParticipant>) {
		return (a: CourseParticipant, b: CourseParticipant) => {
			if (sortConfig.order === SortOrder.Ascending) {
				return compare(sortConfig, a, b);
			}

			return compare(sortConfig, b, a);
		}
	}
}

export const participantStore = new ParticipantStore();

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

export function FirstNameComparator(a: CourseParticipant, b: CourseParticipant) {
	return a.firstName.localeCompare(b.firstName);
}

export function LastNameComparator(a: CourseParticipant, b: CourseParticipant) {
	return a.familyName.localeCompare(b.familyName);
}

export function ParticipantTypeComparator(a: CourseParticipant, b: CourseParticipant) {
	const lhs = a.participantType;
	const rhs = b.participantType;

	if (lhs === rhs) {
		return 0;
	}
	if (lhs === "ORGANISATOR") {
		return 1;
	}
	if (rhs === "ORGANISATOR") {
		return -1;
	}
	if (lhs === "CO_ORGANISATOR") {
		return 1;
	}
	if (rhs === "CO_ORGANISATOR") {
		return -1;
	}

	return 0;
}