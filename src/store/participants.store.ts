import { makeAutoObservable } from "mobx";
import { CourseParticipant } from "../model/participant";
import { SortConfig, SortOrder, compare } from "../utils/sort";
import { State } from "../utils/state";
import { Devices } from "../utils/devices";

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

	setParticipantCameraMute(userId: string, muted: boolean) {
		const participant = this.findByUserId(userId);

		if (participant) {
			participant.cameraMuted = muted;
		}
		else {
			console.warn("Set camera mute failed. Participant with user ID not found", userId);
		}
	}

	setParticipantCameraStream(userId: string, stream: MediaStream) {
		const participant = this.findByUserId(userId);

		console.log(" ** set video stream", participant, stream)

		if (participant) {
			participant.cameraStream = stream;
		}
		else {
			console.warn("Set camera stream failed. Participant with user ID not found", userId);
		}
	}

	removeParticipantCameraStream(userId: string) {
		const participant = this.findByUserId(userId);

		console.log(" ** remove video stream", participant)

		if (participant) {
			Devices.stopMediaTracks(participant.cameraStream);
			participant.cameraStream = null;
		}
		else {
			console.warn("Remove camera stream failed. Participant with user ID not found", userId);
		}
	}

	setParticipantMicrophoneMute(userId: string, muted: boolean) {
		const participant = this.findByUserId(userId);

		if (participant) {
			participant.microphoneMuted = muted;
		}
		else {
			console.warn("Set microphone mute failed. Participant with user ID not found", userId);
		}
	}

	setParticipantMicrophoneStream(userId: string, stream: MediaStream) {
		const participant = this.findByUserId(userId);

		if (participant) {
			participant.microphoneStream = stream;
		}
		else {
			console.warn("Set microphone stream failed. Participant with user ID not found", userId);
		}
	}

	removeParticipantMicrophoneStream(userId: string) {
		const participant = this.findByUserId(userId);

		if (participant) {
			Devices.stopMediaTracks(participant.microphoneStream);
			participant.microphoneStream = null;
		}
		else {
			console.warn("Remove microphone stream failed. Participant with user ID not found", userId);
		}
	}

	setParticipantScreenStream(userId: string, stream: MediaStream) {
		const participant = this.findByUserId(userId);

		if (participant) {
			participant.screenStream = stream;
		}
		else {
			console.warn("Set screen stream failed. Participant with user ID not found", userId);
		}
	}

	removeParticipantScreenStream(userId: string) {
		const participant = this.findByUserId(userId);

		if (participant) {
			Devices.stopMediaTracks(participant.screenStream);
			participant.screenStream = null;
		}
		else {
			console.warn("Remove screen stream failed. Participant with user ID not found", userId);
		}
	}

	setParticipantStreamState(userId: string, state: State) {
		const participant = this.findByUserId(userId);

		if (participant) {
			participant.streamState = state;
		}
		else {
			console.warn("Set stream state failed. Participant with user ID not found", userId);
		}
	}

	getWithStream() {
		return this.participants.filter(participant => participant.streamState === State.CONNECTED);
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